"use client";

import React from "react";
import Style from "@/ai/style.module.css";

interface HeaderProps {
    isSpeaking: boolean;
}

const suggestedPrompts = [
    "What's changed recently?",
    "I want to add Potassium Chloride to her dosage.",
    "Is mom stable enough to travel next week?",
    "What insights should I share with Dr. White today?",
    "What would make the biggest difference for her this week?"
];

const Header: React.FC<HeaderProps> = ({ isSpeaking }) => {
    return (
        <div className="w-full bg-black border-b border-[#F26C3A]/20 p-4">
            <div className="flex justify-center mb-8">
                <div className={`${Style.bars} ${isSpeaking ? Style.speaking : ""}`}>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
            </div>
            
            <div className="max-w-3xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-white/90 text-center">Suggestions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedPrompts.map((prompt, index) => (
                        <div
                            key={index}
                            className="text-[#F26C3A] text-sm text-center"
                        >
                            {prompt}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Header; 