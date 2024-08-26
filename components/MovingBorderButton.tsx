"use client";
import React from "react";
import { Button } from "./ui/moving-border";

export function MovingBorderButton({ text, onClick }: { text?: string, onClick?: () => void }) {
    return (
        <div>
            <Button
                borderRadius="1.75rem"
                className="custom-backdrop"
            >
                <p className="font-semibold text-xl">
                    {text}
                </p>
            </Button>
        </div>
    );
}
