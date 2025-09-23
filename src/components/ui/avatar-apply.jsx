import {ScrollAnimationPage} from '@/components/ui/avatar';

export function AvatarApply({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <ScrollAnimationPage>
        {children}
      </ScrollAnimationPage>
    </div>
  );
}