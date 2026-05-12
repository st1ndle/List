import Toast from './Toast';
import useToastStore from '../../store/useToastStore';
import { useEffect } from 'react';

export default {
  title: 'UI/Toast',
  component: Toast,
};

export const Default = () => {
  const { showToast } = useToastStore();
  
  useEffect(() => {
    showToast('✓', 'Тестовое уведомление');
  }, [showToast]);

  return <Toast />;
};
Default.storyName = 'Default';
