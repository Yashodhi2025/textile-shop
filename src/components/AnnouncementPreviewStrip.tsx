'use client';

import { EditableRotatingAnnouncementBar } from '@deneb-ui/ui';

export default function AnnouncementPreviewStrip() {
  return (
    <div data-preview-page-key="announcement_bar_preview">
      <EditableRotatingAnnouncementBar
        listPath="announcementBarPreview.announcements"
      />
    </div>
  );
}