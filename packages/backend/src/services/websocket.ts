import { Server as SocketIOServer } from 'socket.io';
import { Logger } from 'winston';
import { supabaseClient } from '../config/supabase';

export function setupWebSocket(io: SocketIOServer, logger: Logger) {
  io.on('connection', (socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (token: string) => {
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        
        if (error || !user) {
          socket.emit('auth_error', 'Invalid token');
          return;
        }

        // Store user info in socket
        socket.data.userId = user.id;
        socket.data.authenticated = true;

        // Join user-specific room
        socket.join(`user:${user.id}`);

        // Update user status to online
        await supabaseClient
          .from('users')
          .update({ status: 'online' })
          .eq('id', user.id);

        socket.emit('authenticated', { userId: user.id });
        logger.info(`User authenticated: ${user.id}`);

      } catch (error) {
        logger.error('WebSocket auth error:', error);
        socket.emit('auth_error', 'Authentication failed');
      }
    });

    // Handle chat messages
    socket.on('send_message', async (data: { recipientId: string; message: string }) => {
      if (!socket.data.authenticated) {
        socket.emit('error', 'Not authenticated');
        return;
      }

      try {
        const { recipientId, message } = data;
        
        // Verify friendship
        const { data: friendship } = await supabaseClient
          .from('friends')
          .select('id')
          .or(`and(user_id.eq.${socket.data.userId},friend_id.eq.${recipientId}),and(user_id.eq.${recipientId},friend_id.eq.${socket.data.userId})`)
          .eq('status', 'accepted')
          .single();

        if (!friendship) {
          socket.emit('error', 'Not friends with this user');
          return;
        }

        // Send message to recipient
        io.to(`user:${recipientId}`).emit('new_message', {
          senderId: socket.data.userId,
          message,
          timestamp: new Date().toISOString()
        });

        // Confirm to sender
        socket.emit('message_sent', {
          recipientId,
          message,
          timestamp: new Date().toISOString()
        });

        logger.info(`Message sent from ${socket.data.userId} to ${recipientId}`);

      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (recipientId: string) => {
      if (socket.data.authenticated) {
        io.to(`user:${recipientId}`).emit('user_typing', {
          userId: socket.data.userId,
          typing: true
        });
      }
    });

    socket.on('typing_stop', (recipientId: string) => {
      if (socket.data.authenticated) {
        io.to(`user:${recipientId}`).emit('user_typing', {
          userId: socket.data.userId,
          typing: false
        });
      }
    });

    // Handle download progress updates
    socket.on('download_progress', (data: { gameId: string; progress: number; speed: number }) => {
      if (!socket.data.authenticated) return;

      // Broadcast to user's other devices
      socket.to(`user:${socket.data.userId}`).emit('download_update', {
        gameId: data.gameId,
        progress: data.progress,
        speed: data.speed,
        timestamp: new Date().toISOString()
      });
    });

    // Handle presence updates
    socket.on('status_update', async (status: 'online' | 'away' | 'in_game' | 'offline') => {
      if (!socket.data.authenticated) return;

      try {
        await supabaseClient
          .from('users')
          .update({ status })
          .eq('id', socket.data.userId);

        // Notify friends of status change
        const { data: friends } = await supabaseClient
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${socket.data.userId},friend_id.eq.${socket.data.userId}`)
          .eq('status', 'accepted');

        if (friends) {
          friends.forEach(friend => {
            const friendId = friend.user_id === socket.data.userId ? friend.friend_id : friend.user_id;
            io.to(`user:${friendId}`).emit('friend_status_update', {
              userId: socket.data.userId,
              status
            });
          });
        }

      } catch (error) {
        logger.error('Status update error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.data.authenticated) {
        try {
          // Update user status to offline
          await supabaseClient
            .from('users')
            .update({ status: 'offline' })
            .eq('id', socket.data.userId);

          logger.info(`User disconnected: ${socket.data.userId}`);
        } catch (error) {
          logger.error('Disconnect error:', error);
        }
      }

      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  logger.info('WebSocket server initialized');
}
