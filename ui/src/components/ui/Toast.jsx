import { useEffect } from 'react';
import useToastStore from '../../store/useToastStore';

function Toast() {
  const { message, icon, visible, hideToast } = useToastStore();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [visible, hideToast]);

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      {icon && <span className="toast-ic">{icon}</span>}
      <div>{message}</div>
    </div>
  );
}

export default Toast;
