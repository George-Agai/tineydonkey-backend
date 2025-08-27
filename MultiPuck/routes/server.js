const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const Port = process.env.MULTI_PUCK_PORT

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

/**
 * Room model:
 * - first to join is "host"
 * - second is "guest"
 * - host simulates and broadcasts state
 */
const rooms = new Map(); // roomId -> { hostId, guestId }

io.on('connection', (socket) => {
    console.log(`🆕 Somebody joined`);
    socket.on('join', ({ roomId }) => {
        // console.log(`Player ${socket.id} joined room ${roomId}`);
        // console.log(`🆕 New room created → ${roomId}`);
        let room = rooms.get(roomId);

        if (!room) {
            // First player is host
            room = { hostId: socket.id, guestId: null };
            rooms.set(roomId, room);
            socket.join(roomId);
            io.to(socket.id).emit('role', { role: 'host' });
            console.log(`👑 Host Joined Room → ${roomId}`);

        } else if (!room.guestId) {
            // Second player is guest
            room.guestId = socket.id;
            socket.join(roomId);
            io.to(room.hostId).emit('role', { role: 'host' });
            io.to(room.guestId).emit('role', { role: 'guest' });

            // notify both sides that game can start
            io.to(roomId).emit('opponent:joined');
            console.log(`🙋 Guest Joined Room → ${roomId}`);
        } else {
            // Room is full
            io.to(socket.id).emit('room:full');
            console.log(`⚠️ Room ${roomId} is full, rejected ${socket.id}`);
        }
    });

    socket.on('paddle', ({ roomId, paddlePct }) => {
        socket.to(roomId).emit('paddle', { paddlePct });
    });

    socket.on('playAgain', ({ roomId }) => {
        console.log(`🔄 Play Again in Room → ${roomId}`);
        socket.to(roomId).emit('playAgain');
    });

    // Host sends authoritative game state to guest
    socket.on('state', ({ roomId, state }) => {
        socket.to(roomId).emit('state', state);
    });

    // Round ended
    socket.on('roundEnd', ({ roomId, payload }) => {
        socket.to(roomId).emit('roundEnd', payload);
    });

    // Match ended
    socket.on('matchEnd', ({ roomId, payload }) => {
        console.log(`🏆 Match End in Room → ${roomId}`);
        socket.to(roomId).emit('matchEnd', payload);
    });

    // Player leaves or disconnects
    socket.on('disconnect', () => {
        console.log(`❌ Player Disconnected → ${socket.id}`);
        for (const [roomId, r] of rooms.entries()) {
            if (r.hostId === socket.id || r.guestId === socket.id) {
                io.to(roomId).emit('opponent:left');
                rooms.delete(roomId);
                console.log(`🔒 Room ${roomId} closed, player left`);
                break;
            }
        }
    });
});

httpServer.listen(Port, '0.0.0.0', () => console.log(`🏒 Multi Puck `));