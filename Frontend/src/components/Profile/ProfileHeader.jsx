import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon as UserSolid, PencilIcon } from '@heroicons/react/24/solid';

const ProfileHeader = ({ user, isEditing, onEditToggle, formatDate }) => {
  return (
    <div className="bg-linear-to-r from-red-600 to-red-800 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
            <UserSolid className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-red-100 mt-1">{user.email}</p>
            <p className="text-red-200 text-sm mt-2">
              Member since {user.createdAt ? formatDate(user.createdAt) : 'Recently'}
            </p>
          </div>
        </div>
        <button
          onClick={onEditToggle}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-red-700 px-6 py-3 rounded-lg transition duration-300 border border-white border-opacity-30 flex items-center space-x-2"
        >
          <PencilIcon className="h-5 w-5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
