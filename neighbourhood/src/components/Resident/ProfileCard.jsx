import React from 'react';

const ProfileCard = ({ name = "John Doe", role = "Resident", posts = 0, followers = 0, following = 0, bio = "", imageUrl = "https://via.placeholder.com/150" }) => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      {/* Profile Image Section */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={`${name}'s profile`}
          className="absolute bottom-0 transform translate-y-1/2 rounded-full border-4 border-white w-32 h-32 object-cover"
        />
      </div>

      {/* Profile Info Section */}
      <div className="pt-20 pb-8 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
        <p className="text-gray-600 mt-1">{role}</p>
        
        {/* Stats Section */}
        <div className="mt-6 flex justify-around text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-800">{posts}</span>
            <p>Posts</p>
          </div>
          <div>
            <span className="font-semibold text-gray-800">{followers}</span>
            <p>Followers</p>
          </div>
          <div>
            <span className="font-semibold text-gray-800">{following}</span>
            <p>Following</p>
          </div>
        </div>

        {/* Bio Section */}
        <p className="mt-4 text-gray-700 text-sm leading-relaxed">
          {bio || "Resident of the community. Manage your profile and stay connected."}
        </p>

        {/* Action Button */}
        <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;