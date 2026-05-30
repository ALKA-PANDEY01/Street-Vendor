import { Server } from "socket.io";

let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        // vendor joins room with their userId
        socket.on("joinVendorRoom", (vendorId) => {
            socket.join(vendorId);
            console.log(`Vendor ${vendorId} joined room ${vendorId}`);
        });

        // user joins room with their userId
        socket.on("joinUserRoom", (userId) => {
            socket.join(userId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });
};

export const getIO = () => io;
export const sendNotificationToVendor = (vendorId, notification) => {
    if (io) {
        io.to(vendorId).emit("newOrder", notification);
    } else {
        console.error("Socket.io not initialized");
    }
};
 export const sendNotificationToUser = (userId, notification) => {
    if (io) {
        io.to(userId).emit("orderStatusUpdate", notification);
    } else {
        console.error("Socket.io not initialized");
    }
};

