import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import * as Icons from "lucide-react";

interface IconPickerProps {
  value: string;
  onValueChange: (value: string) => void;
}

// Curated list of medical and health-related icons
const MEDICAL_ICONS = [
  "Activity",
  "Syringe",
  "Heart",
  "HeartPulse",
  "Stethoscope",
  "Pill",
  "Brain",
  "Zap",
  "Droplet",
  "Cross",
  "Thermometer",
  "Clipboard",
  "FileText",
  "Shield",
  "Eye",
  "Ear",
  "Hand",
  "Bone",
  "Dna",
  "Microscope",
  "TestTube",
  "Hospital",
  "Ambulance",
  "BandAid",
  "User",
  "Users",
  "Sparkles",
  "Star",
  "Plus",
  "AlertCircle",
];

const IconPicker = ({ value, onValueChange }: IconPickerProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = MEDICAL_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              {SelectedIcon}
              <span>{value || "Select an icon..."}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-4 border-b">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-4 gap-2 p-4">
              {filteredIcons.map((iconName) => {
                const IconComponent = getIconComponent(iconName);
                const isSelected = value === iconName;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onValueChange(iconName);
                      setOpen(false);
                    }}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors hover:bg-accent ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-transparent"
                    }`}
                  >
                    {isSelected && (
                      <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                    )}
                    <div className="text-muted-foreground">{IconComponent}</div>
                    <span className="text-xs text-center">{iconName}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IconPicker;
