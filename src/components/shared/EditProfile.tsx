import React, { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import type { EditProfileModalProps, UserProfile } from '@/types';

function EditProfileModal({ isOpen, onClose, onSave, profile }: EditProfileModalProps): React.ReactElement {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setAvatar(profile.avatar || '');
    setBio(profile.bio || '');
  }, [profile, isOpen]);

  const handleSave = (): void => {
    if (!name.trim() || !email.trim()) return;

    const profileData: Partial<UserProfile> = {
      name: name.trim(),
      email: email.trim(),
      avatar: avatar.trim() || undefined,
      bio: bio.trim() || undefined,
    };

    onSave(profileData);
    onClose();
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement>): void => {
    e.currentTarget.src = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[85vw] bg-card border-border rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="pt-4">
            Update your personal information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-input-background border-border rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="bg-input-background border-border rounded-lg"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL (Optional)</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-input-background border-border rounded-lg"
            />
            {avatar && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <img 
                  src={avatar} 
                  alt="Avatar preview" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={handleImageError}
                />
                <p className="text-sm text-muted-foreground">Avatar preview</p>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself..."
              className="bg-input-background border-border rounded-lg resize-none min-h-20"
            />
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim()}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfileModal;