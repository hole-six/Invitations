import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const TrialPublicationModal = ({ invitation, onConfirm, onClose }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!invitation?.trial_expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(invitation.trial_expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);

      if (remaining === 0) {  
        setIsExpired(true);
        setTimeRemaining(null);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining({ minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [invitation?.trial_expires_at]);

  const formatTime = () => {
    if (!timeRemaining) return '00:00';
    return `${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isExpired ? 'Thời gian dùng thử đã hết' : 'Đang dùng thử'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {!isExpired ? (
          <>
            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatTime()}
                </div>
                <p className="text-sm text-gray-600">
                  Thời gian còn lại
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Thiệp mời của bạn đang được xuất bản trong chế độ dùng thử <strong>10 phút</strong>.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Nhấn <strong>"Gia hạn gói"</strong> để xuất bản vĩnh viễn, hoặc thiệp sẽ tự động chuyển về bản nháp sau khi hết thời gian.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Gia hạn gói ngay
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Expired State */}
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700 mb-6">
                Thời gian dùng thử đã hết. Thiệp mời đã được chuyển về bản nháp.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrialPublicationModal;
