"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TopologyService } from "../../model";
import { useApi } from "@/shared/lib/hooks/useApi";
import { createDependency, deleteDependency } from "../../api";
import { showErrorToast, showSuccessToast } from "@/shared/ui";

interface DependencyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: TopologyService;
  availableServices: TopologyService[];
  existingDependencies: string[];
}

export function DependencyManager({
  isOpen,
  onClose,
  onSuccess,
  service,
  availableServices,
  existingDependencies,
}: DependencyManagerProps) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  useEffect(() => {
    setSelectedDependencies(existingDependencies);
  }, [existingDependencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove dependencies that were unselected
      const removedDependencies = existingDependencies.filter(
        (dep) => !selectedDependencies.includes(dep)
      );
      
      // Add new dependencies that were selected
      const newDependencies = selectedDependencies.filter(
        (dep) => !existingDependencies.includes(dep)
      );

      // Process removals
      for (const depId of removedDependencies) {
        await deleteDependency(api, service.id, depId);
      }

      // Process additions
      for (const depId of newDependencies) {
        await createDependency(api, service.id, depId);
      }

      showSuccessToast("Dependencies updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update dependencies:", error);
      showErrorToast("Failed to update dependencies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDependency = (serviceId: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Dependencies</DialogTitle>
          <DialogDescription>
            Select the services that {service.display_name} depends on
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {availableServices
              .filter((s) => s.id !== service.id)
              .map((availableService) => (
                <div
                  key={availableService.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={availableService.id}
                    checked={selectedDependencies.includes(availableService.id)}
                    onChange={() => toggleDependency(availableService.id)}
                    disabled={isLoading}
                  />
                  <label htmlFor={availableService.id}>
                    {availableService.display_name}
                  </label>
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Dependencies"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 