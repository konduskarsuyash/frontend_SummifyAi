'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User, MapPin, Edit2, Save, X } from 'lucide-react'
import Statistics from './Statistics';
import Contributions from './Contributions';

// Basic Button component
const Button = ({ children, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
)

// Basic Input component
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 ${className}`}
    {...props}
  />
)

// Basic Textarea component
const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 ${className}`}
    {...props}
  />
)

// Basic Card components
const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-700">{children}</div>
)

const CardTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-white">{children}</h2>
)

const CardContent = ({ children }) => (
  <div className="p-6">{children}</div>
)

export default function UserProfile() {
  const { user_id } = useParams()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user_id) {
      setError('User ID is not provided')
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profile/${user_id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) throw new Error('Profile not found')
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchProfile()
  }, [user_id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }))
  }

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/profile/${user_id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profile.username,
          bio: profile.bio,
          location: profile.location,
        }),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      const updatedData = await response.json()
      setProfile(updatedData)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  if (!profile) {
    return <div className="text-center p-4">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-24 h-24 mx-auto text-gray-400" />
                {isEditing ? (
                  <Input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="mt-2 text-center"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mt-2">{profile.username}</h2>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Edit2 className="w-5 h-5 mr-2" /> Bio
                </h3>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-300">{profile.bio}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" /> Location
                </h3>
                {isEditing ? (
                  <Input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-gray-300">{profile.location}</p>
                )}
              </div>

              {isEditing ? (
                <div className="flex space-x-4">
                  <Button onClick={handleProfileUpdate} className="flex-1">
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Statistics userId={user_id} />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <Contributions userId={user_id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}