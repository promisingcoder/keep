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
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { TopologyService } from "../../model";
import { useApi } from "@/shared/lib/hooks/useApi";
import { createService, updateService } from "../../api";
import { showErrorToast, showSuccessToast } from "@/shared/ui";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service?: TopologyService;
}

export function ServiceModal({
  isOpen,
  onClose,
  onSuccess,
  service,
}: ServiceModalProps) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<TopologyService>>({
    service: "",
    display_name: "",
    description: "",
    team: "",
    email: "",
    slack: "",
    environment: "production",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        service: service.service,
        display_name: service.display_name,
        description: service.description,
        team: service.team,
        email: service.email,
        slack: service.slack,
        environment: service.environment || "production",
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (service) {
        await updateService(api, service.id, formData);
        showSuccessToast("Service updated successfully");
      } else {
        await createService(api, formData);
        showSuccessToast("Service created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save service:", error);
      showErrorToast(
        `Failed to ${service ? "update" : "create"} service. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Service" : "Create New Service"}
          </DialogTitle>
          <DialogDescription>
            {service
              ? "Update the service details below"
              : "Enter the details for the new service"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Service Name *</Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                required
                disabled={!!service} // Can't change service name for existing services
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) =>
                  setFormData({ ...formData, team: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slack">Slack Channel</Label>
              <Input
                id="slack"
                value={formData.slack}
                onChange={(e) =>
                  setFormData({ ...formData, slack: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="environment">Environment *</Label>
              <Input
                id="environment"
                value={formData.environment}
                onChange={(e) =>
                  setFormData({ ...formData, environment: e.target.value })
                }
                required
              />
            </div>
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
              {isLoading
                ? service
                  ? "Updating..."
                  : "Creating..."
                : service
                ? "Update Service"
                : "Create Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 