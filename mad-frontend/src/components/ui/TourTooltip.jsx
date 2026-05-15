import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../../contexts/TourContext';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';

const TourTooltip = () => {
    const { isActive, currentStep, totalSteps, stepData, nextStep, prevStep, endTour } = useTour();
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (isActive && stepData) {
            const updatePosition = () => {
                const element = document.querySelector(stepData.target);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const scrollY = window.scrollY;
                    const scrollX = window.scrollX;

                    let top = rect.bottom + scrollY + 15;
                    let left = rect.left + scrollX + (rect.width / 2);

                    if (stepData.position === 'top') {
                        top = rect.top + scrollY - 200; // Estimated height
                    } else if (stepData.position === 'left') {
                        top = rect.top + scrollY + (rect.height / 2);
                        left = rect.left + scrollX - 320;
                    } else if (stepData.position === 'right') {
                        top = rect.top + scrollY + (rect.height / 2);
                        left = rect.right + scrollX + 20;
                    }

                    setCoords({ top, left });
                    
                    // Smooth scroll to element
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add highlight class
                    element.classList.add('tour-highlight');
                    return () => element.classList.remove('tour-highlight');
                }
            };

            const cleanup = updatePosition();
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('resize', updatePosition);
                if (cleanup) cleanup();
            };
        }
    }, [isActive, stepData, currentStep]);

    if (!isActive || !stepData) return null;

    return createPortal(
        <div 
            ref={tooltipRef}
            className="fixed z-[9999] w-[300px] pointer-events-auto animate-fade-in-up"
            style={{ 
                top: `${coords.top}px`, 
                left: `${coords.left}px`,
                transform: stepData.position === 'bottom' || stepData.position === 'top' ? 'translateX(-50%)' : 'translateY(-50%)'
            }}
        >
            <div className="relative p-6 bg-admin-bg-secondary/90 backdrop-blur-2xl border border-admin-accent/40 rounded-[2rem] shadow-premium-lg overflow-hidden group">
                {/* Ambient Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-admin-accent/20 rounded-full blur-3xl group-hover:bg-admin-accent/30 transition-colors" />
                
                <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-admin-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-admin-accent">
                                Guided Tour • {currentStep + 1}/{totalSteps}
                            </span>
                        </div>
                        <button onClick={endTour} className="p-1 hover:bg-admin-hover rounded-full transition-colors">
                            <X className="w-4 h-4 text-admin-text-muted" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-lg font-black text-admin-text tracking-tight uppercase">
                            {stepData.title}
                        </h4>
                        <p className="text-xs text-admin-text-secondary leading-relaxed font-medium">
                            {stepData.content}
                        </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button 
                                    onClick={prevStep}
                                    className="p-2 bg-admin-bg-tertiary hover:bg-admin-hover text-admin-text rounded-xl transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={nextStep}
                            className="btn-premium px-6 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Arrow */}
            <div 
                className={`absolute w-4 h-4 bg-admin-bg-secondary/90 border-t border-l border-admin-accent/40 rotate-45 ${
                    stepData.position === 'bottom' ? '-top-2 left-1/2 -translate-x-1/2' :
                    stepData.position === 'top' ? '-bottom-2 left-1/2 -translate-x-1/2 rotate-[225deg]' :
                    stepData.position === 'left' ? '-right-2 top-1/2 -translate-y-1/2 rotate-[135deg]' :
                    '-left-2 top-1/2 -translate-y-1/2 rotate-[315deg]'
                }`}
            />
        </div>,
        document.body
    );
};

export default TourTooltip;
