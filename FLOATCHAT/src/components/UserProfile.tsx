import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Settings, LogOut, X, Edit3, Save, 
  MessageSquare, BarChart3, MapPin, Bell, Globe,
  Star, Clock, TrendingUp, Database
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  stats: {
    totalChats: number;
    dataQueriesCount: number;
    favoriteRegions: string[];
  };
}

interface ChatHistory {
  id: string;
  messageCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
  } | null;
  updatedAt: string;
}

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  accessToken: string;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  user,
  accessToken,
  onLogout,
  onUserUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  
  const [editForm, setEditForm] = useState({
    name: user.name,
    role: user.role,
    preferences: { ...user.preferences }
  });

  // Supabase client is now imported as singleton

  // Fetch chat history
  useEffect(() => {
    if (isOpen && user.id) {
      fetchChatHistory();
    }
  }, [isOpen, user.id]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c21e50/chat-history/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c21e50/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editForm)
        }
      );

      if (response.ok) {
        const updatedUser = {
          ...user,
          ...editForm
        };
        onUserUpdate(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway
      onClose();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="glass-card border-slate-600/30 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-ocean-blue to-cyan-teal text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <Badge variant="outline" className="mt-1 border-cyan-teal/30 text-cyan-teal">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList className="grid w-full grid-cols-3 m-6 mb-0 bg-slate-800/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-ocean-blue">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-ocean-blue">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat History
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-ocean-blue">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="glass-card border-slate-600/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-teal/20 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-cyan-teal" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold text-white">{user.stats.totalChats}</p>
                            <p className="text-sm text-slate-400">AI Conversations</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="glass-card border-slate-600/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-ocean-blue/20 flex items-center justify-center">
                            <Database className="w-5 h-5 text-ocean-blue-light" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold text-white">{user.stats.dataQueriesCount}</p>
                            <p className="text-sm text-slate-400">Data Queries</p>
                          </div>
                        </div>
                      </Card>

                      <Card className="glass-card border-slate-600/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-coral-orange/20 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-coral-orange" />
                          </div>
                          <div>
                            <p className="text-2xl font-semibold text-white">{user.stats.favoriteRegions.length}</p>
                            <p className="text-sm text-slate-400">Favorite Regions</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Favorite Regions */}
                    <Card className="glass-card border-slate-600/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-cyan-teal" />
                        Favorite Ocean Regions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.stats.favoriteRegions.length > 0 ? (
                          user.stats.favoriteRegions.map((region, index) => (
                            <Badge key={index} variant="outline" className="border-ocean-blue/30 text-ocean-blue-light">
                              {region}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-400">No favorite regions yet. Start exploring!</p>
                        )}
                      </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="glass-card border-slate-600/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-teal" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {chatHistory.slice(0, 3).map((chat) => (
                          <div key={chat.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <div>
                              <p className="text-sm text-white">
                                {chat.lastMessage?.content.substring(0, 60)}...
                              </p>
                              <p className="text-xs text-slate-400">{chat.messageCount} messages</p>
                            </div>
                            <p className="text-xs text-slate-400">
                              {chat.lastMessage ? formatDate(chat.lastMessage.timestamp) : 'No messages'}
                            </p>
                          </div>
                        ))}
                        {chatHistory.length === 0 && (
                          <p className="text-slate-400">No recent activity</p>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Chat History</h3>
                      <Button variant="outline" size="sm" onClick={fetchChatHistory}>
                        Refresh
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {chatHistory.map((chat) => (
                        <Card key={chat.id} className="glass-card border-slate-600/30 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-cyan-teal" />
                                <span className="text-sm font-medium text-white">
                                  Conversation {chat.id}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {chat.messageCount} messages
                                </Badge>
                              </div>
                              {chat.lastMessage && (
                                <p className="text-sm text-slate-300 mb-2">
                                  {chat.lastMessage.content.substring(0, 100)}...
                                </p>
                              )}
                              <p className="text-xs text-slate-400">
                                Last updated: {formatDate(chat.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {chatHistory.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                          <p className="text-slate-400">No chat history yet</p>
                          <p className="text-sm text-slate-500">Start a conversation with the AI assistant!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <Card className="glass-card border-slate-600/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-slate-300">Name</Label>
                            <Input
                              id="edit-name"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600/30"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="edit-role" className="text-slate-300">Role</Label>
                            <Input
                              id="edit-role"
                              value={editForm.role}
                              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                              className="bg-slate-800/50 border-slate-600/30"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveProfile}
                              disabled={isLoading}
                              className="bg-ocean-blue hover:bg-ocean-blue-dark"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-400">Name</Label>
                            <p className="text-white">{user.name}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Email</Label>
                            <p className="text-white">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-slate-400">Role</Label>
                            <p className="text-white">{user.role}</p>
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card className="glass-card border-slate-600/30 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <Label className="text-slate-300">Notifications</Label>
                          </div>
                          <Switch
                            checked={editForm.preferences.notifications}
                            onCheckedChange={(checked) =>
                              setEditForm(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, notifications: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <Label className="text-slate-300">Language</Label>
                          </div>
                          <Badge variant="outline" className="border-cyan-teal/30 text-cyan-teal">
                            {editForm.preferences.language === 'en' ? 'English' : 'Français'}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Separator className="bg-slate-600/30" />

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};