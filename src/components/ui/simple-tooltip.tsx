import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimpleTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    className?: string;
}

export function SimpleTooltip({
    children,
    content,
    side = "top",
    align = "center",
    className,
}: SimpleTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side} align={align} className={className}>
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
