import type { ReactNode } from 'react';
import WorkspaceDialog from './WorkspaceDialog';

interface Props {
  children: ReactNode;
  onClose: () => void;
}

export default function WorkspaceSearch({ children, onClose }: Props) {
  return (
    <WorkspaceDialog title="搜索角色" onClose={onClose} className="v2-search-dialog">
      {children}
    </WorkspaceDialog>
  );
}
