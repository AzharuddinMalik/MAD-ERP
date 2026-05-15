import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Plus, MapPin, Loader2, X } from 'lucide-react';
import api from '../api/axiosConfig';
import { useQueryClient } from '@tanstack/react-query';

const CitySearch = ({ selectedCityId, onSelect }) => {
    const queryClient = useQueryClient();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [newCityState, setNewCityState] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
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
            if (err.name === 'CanceledError') return;
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
            onSelect(newCity);
            queryClient.invalidateQueries(['cities']); // ✅ Refreshes global state
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
        <div className="relative font-admin" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-admin-text-muted" />
                </div>
                <input
                    type="text"
                    className="w-full pl-9 pr-10 p-2.5 rounded-lg border border-admin-border bg-admin-card text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none transition-all text-sm"
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
                    <ChevronsUpDown className="h-4 w-4 text-admin-text-muted hover:text-admin-text transition-colors" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-admin-card border border-admin-border rounded-lg shadow-xl shadow-black/10 max-h-60 overflow-auto">
                    {loading ? (
                        <div className="p-4 text-center text-admin-text-muted text-sm flex justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    ) : filteredCities.length === 0 ? (
                        <div className="p-2">
                            <div className="p-3 text-sm text-admin-text-muted text-center">No city found.</div>
                            <button
                                type="button"
                                onClick={() => { setIsModalOpen(true); setIsOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 p-2.5 text-sm text-admin-accent bg-admin-accent/10 hover:bg-admin-accent/20 rounded-md font-bold transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add "{query}"
                            </button>
                        </div>
                    ) : (
                        <ul className="py-1">
                            {filteredCities.map((city) => (
                                <li
                                    key={city.id}
                                    className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors
                                        ${parseInt(selectedCityId) === city.id 
                                            ? 'bg-admin-accent/10 text-admin-accent font-bold border-l-2 border-admin-accent' 
                                            : 'text-admin-text hover:bg-admin-hover hover:text-admin-accent border-l-2 border-transparent'}`}
                                    onClick={() => {
                                        onSelect(city);
                                        setQuery(city.name);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{city.name} <span className="text-admin-text-muted text-xs ml-1 font-normal">({city.state})</span></span>
                                    {parseInt(selectedCityId) === city.id && <Check className="w-4 h-4" />}
                                </li>
                            ))}
                            <li className="border-t border-admin-border p-2 mt-1">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(true); setIsOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 p-2 text-xs font-bold text-admin-text-secondary hover:text-admin-accent hover:bg-admin-hover rounded-md transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add New City
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            )}

            {/* ADD CITY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-admin-card rounded-xl shadow-2xl shadow-black/20 border border-admin-border max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-5 border-b border-admin-border pb-3">
                            <h3 className="text-lg font-bold text-admin-text">Add New City</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-admin-text-muted hover:text-admin-text p-1 rounded hover:bg-admin-hover transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-admin-text-secondary mb-1.5">City Name <span className="text-admin-danger">*</span></label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 rounded-lg border border-admin-border bg-admin-bg text-admin-text focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none text-sm"
                                    value={newCityName || query}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    placeholder="e.g. Pune"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-admin-text-secondary mb-1.5">State <span className="text-admin-danger">*</span></label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-admin-border bg-admin-bg text-admin-text focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/30 outline-none text-sm"
                                    value={newCityState}
                                    onChange={(e) => setNewCityState(e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Ladakh">Ladakh</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Puducherry">Puducherry</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddCity}
                                disabled={addLoading}
                                className="w-full mt-2 py-3 bg-admin-accent hover:bg-admin-accent-hover text-white rounded-lg font-bold shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
