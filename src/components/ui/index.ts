// Barrel export, pour `import { Button, Card, Stat, Badge, … } from "@/components/ui"`
export { Button, LinkButton } from "./button";
export type { LinkButtonProps } from "./button";
export { Card, CardHeader, CardBody, CardFooter } from "./card";
export { Stat } from "./stat";
export type { IconTone, StatDelta, StatProps } from "./stat";
export { SegmentedControl } from "./segmented-control";
export type { SegmentedControlOption, SegmentedControlProps } from "./segmented-control";
export { Badge } from "./badge";
export { ScoreRing } from "./score-ring";
export type { ScoreRingProps } from "./score-ring";
export { ScoreBar } from "./score-bar";
export type { ScoreBarProps } from "./score-bar";
export { SegmentBar } from "./segment-bar";
export type { SegmentBarSegment, SegmentBarProps, SegmentTone } from "./segment-bar";
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
export { GlossaryInfo, GlossaryTerm } from "./glossary-info";
export type { GlossaryInfoProps } from "./glossary-info";
export { PageHeader, PageHeaderKpis } from "./page-header";
export type { PageHeaderProps, PageHeaderKpi } from "./page-header";
export { PageContainer } from "./page-container";
export type { PageContainerProps } from "./page-container";
export { MetricBadge } from "./metric-badge";
export type { MetricBadgeTone } from "./metric-badge";
export { EntityTypeBadge } from "./entity-type-badge";
export type { EntityType } from "./entity-type-badge";
export { Skeleton } from "./skeleton";
export { Banner } from "./banner";
export { EmptyState } from "./empty-state";
export { Pagination } from "./pagination";
export { Toaster, toast } from "./toaster";
