import { Lock, Package, Truck } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-secondary text-muted-foreground text-[10px] md:text-xs py-1.5 md:py-2 relative overflow-hidden">
      <div className="container flex items-center justify-center gap-3 md:gap-10 flex-nowrap md:flex-wrap px-2 md:px-8">
        <div className="flex items-center gap-1 shrink-0">
          <Lock className="w-3 h-3 text-primary" />
          <span>Discreet Packaging</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Package className="w-3 h-3 text-primary" />
          <span>Private Billing</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Truck className="w-3 h-3 text-primary" />
          <span>Free Shipping ₹999+</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
