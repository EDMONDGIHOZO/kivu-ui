export { cx, type ClassValue } from "./utils/cx";
export { Slot } from "./utils/slot";
export type { Size, Tone } from "./utils/types";

export { Button, type ButtonProps, type ButtonVariant, type ButtonTone } from "./components/button/Button";
export { IconButton, type IconButtonProps } from "./components/button/IconButton";
export { Spinner, type SpinnerProps } from "./components/spinner/Spinner";
export { Badge, type BadgeProps } from "./components/badge/Badge";

export type { FieldBaseProps } from "./components/input/Field";
export { Input, type InputProps } from "./components/input/Input";
export { Textarea, type TextareaProps } from "./components/input/Textarea";
export { Select, type SelectProps, type SelectOption } from "./components/input/Select";
export { Checkbox, Switch, type CheckboxProps, type SwitchProps } from "./components/checkbox/Checkbox";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsPanelProps,
} from "./components/tabs/Tabs";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionTriggerProps,
} from "./components/accordion/Accordion";

export { Card, type CardProps } from "./components/card/Card";
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps } from "./components/avatar/Avatar";
export { IconTile, type IconTileProps, Medallion, type MedallionProps } from "./components/section/IconTile";
export { SectionHeader, Highlight, type SectionHeaderProps } from "./components/section/SectionHeader";
export { Banner, type BannerProps } from "./components/banner/Banner";
export { Container, Divider, type ContainerProps, type DividerProps } from "./components/layout/Layout";
export { Modal, type ModalProps } from "./components/modal/Modal";

/* App shell & navigation */
export {
  AppShell, SidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, Topbar, useAppShell,
  type AppShellProps, type SidebarTriggerProps, type SidebarGroupProps, type SidebarItemProps,
} from "./components/app-shell/AppShell";
export { PageHeader, Breadcrumbs, BreadcrumbItem, type PageHeaderProps, type BreadcrumbItemProps } from "./components/page-header/PageHeader";
export { Drawer, type DrawerProps } from "./components/drawer/Drawer";

/* Overlays */
export { Tooltip, type TooltipProps } from "./components/tooltip/Tooltip";
export {
  Popover, PopoverTrigger, PopoverContent, PopoverClose,
  type PopoverProps, type PopoverTriggerProps, type PopoverContentProps,
} from "./components/popover/Popover";
export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  type DropdownMenuProps, type DropdownMenuTriggerProps, type DropdownMenuContentProps,
  type DropdownMenuItemProps, type DropdownMenuCheckboxItemProps,
} from "./components/dropdown-menu/DropdownMenu";

/* Data display */
export { StatCard, type StatCardProps, type StatTrend } from "./components/stat-card/StatCard";
export { Skeleton, SkeletonText, type SkeletonProps, type SkeletonTextProps } from "./components/skeleton/Skeleton";
export {
  Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption,
  type TableProps, type TableRowProps, type TableHeadProps, type TableCellProps, type SortDirection, type CellAlign,
} from "./components/table/Table";
export { DataTable, type DataTableProps, type DataTableColumn, type SortState } from "./components/table/DataTable";
export { Pagination, paginationRange, type PaginationProps, type PaginationItem } from "./components/pagination/Pagination";
export { EmptyState, type EmptyStateProps } from "./components/empty-state/EmptyState";

/* Feedback */
export { Toaster, toast, type ToasterProps, type ToastOptions, type ToastTone } from "./components/toast/Toast";
export { Progress, type ProgressProps } from "./components/progress/Progress";

/* Forms */
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from "./components/segmented-control/SegmentedControl";
export { RadioGroup, Radio, type RadioGroupProps, type RadioProps } from "./components/radio/RadioGroup";
export { Combobox, type ComboboxProps, type ComboboxOption, type ComboboxSingleProps, type ComboboxMultipleProps } from "./components/combobox/Combobox";
export { Calendar, type CalendarProps, type CalendarSingleProps, type CalendarRangeProps } from "./components/date-picker/Calendar";
export { DatePicker, DateRangePicker, type DatePickerProps, type DateRangePickerProps } from "./components/date-picker/DatePicker";
export { defaultDateRangePresets, formatRange, type DateRange, type DateRangePreset } from "./components/date-picker/dates";

/* Charts */
export { Sparkline, type SparklineProps } from "./charts/Sparkline";
export {
  CHART_SERIES_COUNT, chartColors, chartColor, chartSeries, getChartTheme, readChartTheme, rechartsTheme, echartsTheme,
  type ResolvedChartTheme,
} from "./charts/theme";
