import { Edit2, Lock } from "lucide-react";

export function ServiceNode({ data, ...props }: ServiceNodeProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow",
        {
          "border-primary": selected,
          "border-muted": !selected,
          "opacity-50": !data.is_editable,
        }
      )}
      {...props}
    >
      <div className="absolute -top-2 -right-2">
        {data.is_manual ? (
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Edit2 className="h-3 w-3" />
          </div>
        ) : (
          <div className="bg-muted text-muted-foreground rounded-full p-1">
            <Lock className="h-3 w-3" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* ... existing content ... */}
        </div>
      </div>
    </div>
  );
} 