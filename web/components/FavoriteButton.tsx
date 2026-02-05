import React from 'react';

export const FavoriteButton: React.FC<{ movieId: string; isFavorite: boolean }> = ({ movieId, isFavorite }) => {
  return (
    <button className={\px-4 py-2 rounded-lg font-bold \\}>
      {isFavorite ? ' Yêu thích' : ' Thêm vào danh sách'}
    </button>
  );
};

export default FavoriteButton;
