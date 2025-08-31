/**
 * @sabo/shared-ui - Updated Design System
 * Standardized components với design tokens integration
 */

// Utility functions
export * from './lib/utils';

// === THEME SYSTEM ===
export * from './theme';

// Core Components (legacy - will be phased out)
export { Button, buttonVariants, type ButtonProps } from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/badge';
export * from './components/loading';

// New Design System Components (v2.0)
// New Design System Components (v2.0)
export { 
  MobileButton, 
  ActionButtons, 
  ButtonGroup,
  type MobileButtonProps 
} from './components/MobileButton';

// NEW: Layout Components
export {
  PageLayout,
  Section,
  FlexGrid,
  type PageLayoutProps,
  type SectionProps,
  type FlexGridProps
} from './components/layout/PageLayout';
export { 
  GridLayout,
  type GridLayoutProps 
} from './components/layout/GridLayout';

// NEW: Typography Components
export {
  BrandedHeading,
  InfoCard,
  type BrandedHeadingProps,
  type InfoCardProps
} from './components/typography/BrandedHeading';

// NEW: Data Components  
export {
  ComparisonDisplay,
  type ComparisonDisplayProps
} from './components/data/ComparisonDisplay';

// NEW: Standard Components for Design System Compliance
export {
  StandardCard,
  TournamentCard,
  PlayerCard,
  CardGrid,
  type StandardCardProps,
  type TournamentCardProps,
  type PlayerCardProps,
  type CardGridProps,
} from './components/StandardCard';

export {
  FormField,
  StandardInput,
  StandardTextarea,
  StandardSelect,
  StandardCheckbox,
  StandardRadio,
  RadioGroup,
  StandardButton,
  type FormFieldProps,
  type StandardInputProps,
  type StandardTextareaProps,
  type StandardSelectProps,
  type StandardCheckboxProps,
  type StandardRadioProps,
  type RadioGroupProps,
  type StandardButtonProps,
} from './components/StandardForm';

// Typography Components
export {
  Heading,
  Text,
  Code,
  Label,
  type HeadingProps,
  type TextProps,
  type CodeProps,
  type LabelProps,
} from './components/Typography';

// Layout Components  
export {
  Container,
  Grid,
  Flex,
  Stack,
  Spacer,
  type ContainerProps,
  type GridProps,
  type FlexProps,
  type StackProps,
  type SpacerProps,
} from './components/Layout';

// Feedback Components
export {
  Alert,
  Toast,
  Modal,
  Tooltip,
  type AlertProps,
  type ToastProps,
  type ModalProps,
  type TooltipProps,
} from './components/Feedback';

// Navigation Components
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  Pagination,
  Menu,
  MenuItem,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
  type BreadcrumbProps,
  type PaginationProps,
  type MenuProps,
  type MenuItemProps,
} from './components/Navigation';

// Data Components
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  List,
  EmptyState,
  DataList,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type ListProps,
  type EmptyStateProps,
  type DataListProps,
} from './components/Data';

// Utility Components
export {
  Progress,
  Badge,
  Separator,
  Loading,
  Avatar,
  type ProgressProps,
  type BadgeProps,
  type SeparatorProps,
  type LoadingProps,
  type AvatarProps,
} from './components/Utils';

// Mobile-First Components (v3.0)
export * from './components/MobileButton';
export * from './components/MobileCard';
export * from './components/MobileInput';

// Mobile-Native Components (Week 3)
export * from './components/SwipeCard';
export * from './components/PullToRefresh';
export * from './components/TouchGestures';
export * from './components/MobileNavigation';

// Typography System
export * from './components/Typography/variants';

// Layout System
export * from './components/Layout/variants';

// Form System
export * from './components/Form/variants';

// Component metadata
export const SharedUIVersion = '2.0.0';
export const ComponentsReady = true;
export const DesignSystemReady = true;
export const ThemeSystemReady = true;

// Quick utility components for inline style elimination
export {
  QuickStyles,
  CursorWrapper,
  DynamicWidth,
  AnimationDelay,
  type QuickStylesProps
} from './components/utils/QuickStyles';
export {
  StyleMigrationHelper,
  AvatarContainer,
  OverlayPosition,
  type StyleMigrationHelperProps
} from './components/utils/StyleMigrationHelper';

// Form Components
export * from './components/forms/FormElements';

// Button Variants  
export * from './components/buttons/ButtonVariants';

// Card Variants
export * from './components/cards/CardVariants';

// Status Components
export * from './components/status/StatusComponents';

// Widget Components
export * from './components/widgets/Widgets';

// Form Components
export * from './components/forms/FormElements';

// Button Variants  
export * from './components/buttons/ButtonVariants';

// Card Variants
export * from './components/cards/CardVariants';

// Status Components
export * from './components/status/StatusComponents';

// Widget Components
export * from './components/widgets/Widgets';

// Interaction Components
export * from './components/interactions/Interactions';

// Media Components
export * from './components/media/MediaComponents';

// Interaction Components
export * from './components/interactions/Interactions';

// Media Components
export * from './components/media/MediaComponents';

// Gaming Components
export * from './components/gaming/RankDisplay';
export * from './components/gaming/PlayerCard';
export * from './components/gaming/MatchStats';
export * from './components/gaming/TournamentBracket';
export * from './components/gaming/LeaderBoard';

// Display Components  
export * from './components/display/ViewportContainer';
export * from './components/display/ResponsiveGrid';
export * from './components/display/FlexContainer';
export * from './components/display/StackLayout';

// Overlay Components
export * from './components/overlay/ModalOverlay';
export * from './components/overlay/TooltipContainer';
export * from './components/overlay/PopoverWrapper';
export * from './components/overlay/DropdownMenu';

// Utility Components
export * from './components/utility/ErrorBoundary';
export * from './components/utility/LoadingSpinner';
export * from './components/utility/EmptyStateDisplay';
export * from './components/utility/NotificationCenter';
