// Specialized button presets for common use cases
import React from 'react';
import { Button } from './Button';
import { ButtonProps } from './ButtonTypes';
import { 
  Trophy, 
  Sword, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  Save,
  Send,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Plus
} from 'lucide-react';

// Tournament specific buttons
export const TournamentButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="tournament" leftIcon={Trophy} {...props} />
);

export const CreateTournamentButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="tournament" leftIcon={Plus} {...props} />
);

export const StartTournamentButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="tournament" leftIcon={Play} {...props} />
);

export const CompleteTournamentButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="success" leftIcon={Trophy} {...props} />
);

// Challenge specific buttons
export const ChallengeButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="challenge" leftIcon={Sword} {...props} />
);

export const CreateChallengeButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="challenge" leftIcon={Plus} {...props} />
);

export const AcceptChallengeButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="success" leftIcon={Sword} {...props} />
);

// SABO special buttons
export const SABOSpecialButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="sabo-special" pulse gradient {...props} />
);

// Common action buttons
export const SaveButton: React.FC<Omit<ButtonProps, 'leftIcon'>> = (props) => (
  <Button leftIcon={Save} {...props} />
);

export const SendButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="primary" leftIcon={Send} {...props} />
);

export const DeleteButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="destructive" leftIcon={Trash2} {...props} />
);

export const EditButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="secondary" leftIcon={Edit} {...props} />
);

export const ViewButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="ghost" leftIcon={Eye} {...props} />
);

export const DownloadButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="outline" leftIcon={Download} {...props} />
);

export const UploadButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="outline" leftIcon={Upload} {...props} />
);

// Gaming specific button combinations
export const JoinGameButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="tournament" leftIcon={Users} pulse {...props} />
);

export const ConfigureButton: React.FC<Omit<ButtonProps, 'variant' | 'leftIcon'>> = (props) => (
  <Button variant="secondary" leftIcon={Settings} {...props} />
);

// Button groups for common patterns
export const ActionButtonGroup: React.FC<{
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
  size?: ButtonProps['size'];
}> = ({ 
  onEdit, 
  onDelete, 
  onView, 
  editLabel = "Edit", 
  deleteLabel = "Delete", 
  viewLabel = "View",
  size = "sm"
}) => (
  <div className="flex gap-2">
    {onView && <ViewButton size={size} onClick={onView}>{viewLabel}</ViewButton>}
    {onEdit && <EditButton size={size} onClick={onEdit}>{editLabel}</EditButton>}
    {onDelete && <DeleteButton size={size} onClick={onDelete}>{deleteLabel}</DeleteButton>}
  </div>
);

export const TournamentActionGroup: React.FC<{
  onStart?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
  onConfigure?: () => void;
  size?: ButtonProps['size'];
}> = ({ onStart, onPause, onComplete, onConfigure, size = "sm" }) => (
  <div className="flex gap-2">
    {onStart && <StartTournamentButton size={size} onClick={onStart}>Start</StartTournamentButton>}
    {onPause && <Button variant="warning" leftIcon={Pause} size={size} onClick={onPause}>Pause</Button>}
    {onComplete && <CompleteTournamentButton size={size} onClick={onComplete}>Complete</CompleteTournamentButton>}
    {onConfigure && <ConfigureButton size={size} onClick={onConfigure}>Configure</ConfigureButton>}
  </div>
);
