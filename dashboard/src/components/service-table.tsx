import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ServiceEntry } from "@aegis-ows/shared";

interface ServiceTableProps {
  services: ServiceEntry[];
}

export function ServiceTable({ services }: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No services registered yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Protocol</TableHead>
          <TableHead>Chains</TableHead>
          <TableHead>Registered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell className="text-muted-foreground max-w-xs truncate">
              {service.description}
            </TableCell>
            <TableCell className="font-mono">
              {service.price} {service.token}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {service.protocol}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {service.chains.map((chain) => (
                  <Badge key={chain} variant="outline" className="text-xs">
                    {chain}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(service.registeredAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
