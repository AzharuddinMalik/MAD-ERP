import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Plus, MapPin, Loader2, X } from 'lucide-react';
import api from '../api/axiosConfig';

const CitySearch = ({ selectedCityId, onSelect }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Add City Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [newCityState, setNewCityState] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchCities = async () => {
        try {
            const res = await api.get('/admin/cities');
            setCities(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch cities", err);
            setLoading(false);
        }
    };

    const handleAddCity = async () => {
        const nameToSubmit = newCityName || query;
        if (!nameToSubmit || !newCityState) {
            alert("Please fill all fields");
            return;
        }
        setAddLoading(true);
        try {
            const res = await api.post('/admin/cities', {
                name: nameToSubmit,
                state: newCityState,
                isActive: true
            });
            const newCity = res.data;
            setCities([...cities, newCity]);
            onSelect(newCity); // Pass full object
            setQuery(newCity.name);
            setIsModalOpen(false);
            setIsOpen(false);
            setNewCityName('');
            setNewCityState('');
        } catch (err) {
            alert("Failed to add city: " + (err.response?.data?.message || err.message));
        } finally {
            setAddLoading(false);
        }
    };

    const filteredCities = query === ''
        ? cities
        : cities.filter((city) =>
            city.name.toLowerCase().includes(query.toLowerCase())
        );

    const selectedCity = cities.find(c => c.id === parseInt(selectedCityId));

    useEffect(() => {
        if (selectedCity) {
            setQuery(selectedCity.name);
        }
    }, [selectedCityId, cities]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 pr-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Search city..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') onSelect(null);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronsUpDown className="h-4 w-4 text-slate-400" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
                    ) : filteredCities.length === 0 ? (
                        <div className="p-2">
                            <div className="p-2 text-sm text-slate-500">No city found.</div>
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(true); setIsOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 p-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add "{query}"
                            </button>
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredCities.map((city) => (
                                <li
                                    key={city.id}
                                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-slate-50
                                        ${parseInt(selectedCityId) === city.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'}`}
                                    onClick={() => {
                                        onSelect(city); // Pass full object
                                        setQuery(city.name);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{city.name} <span className="text-slate-400 text-xs ml-1">({city.state})</span></span>
                                    {parseInt(selectedCityId) === city.id && <Check className="w-4 h-4" />}
                                </li>
                            ))}
                            <li className="border-t border-slate-100 p-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(true); setIsOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-2 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Add New City
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            )}

            {/* ADD CITY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Add New City</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">City Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newCityName || query}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    placeholder="e.g. Pune"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                <select
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={newCityState}
                                    onChange={(e) => setNewCityState(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Delhi">Delhi</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddCity}
                                disabled={addLoading}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all flex justify-center items-center gap-2"
                            >
                                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add City
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitySearch;
