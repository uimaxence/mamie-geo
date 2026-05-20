// Barrel export, pour `import { Button, Card, Stat, Badge, … } from "@/components/ui"`
export { Button, LinkButton } from "./button";
export { Card, CardHeader, CardBody, CardFooter } from "./card";
export { Stat } from "./stat";
export type { IconTone, StatDelta, StatProps } from "./stat";
export { SegmentedControl } from "./segmented-control";
export type { SegmentedControlOption, SegmentedControlProps } from "./segmented-control";
export { Badge } from "./badge";
export { Input, Field } from "./input";
export { Section } from "./section";
export { StatusDot } from "./status-dot";
export { CornerFrame } from "./corner-frame";
export { BottomFade } from "./bottom-fade";

// Primitifs shadcn/Radix (foundation post-login)
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export { Sheet, SheetTrigger, SheetClose, SheetContent } from "./sheet";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible";
export { Switch } from "./switch";
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
export { Skeleton } from "./skeleton";
export { Banner } from "./banner";
export { EmptyState } from "./empty-state";
export { Pagination } from "./pagination";
export { Toaster, toast } from "./toaster";
