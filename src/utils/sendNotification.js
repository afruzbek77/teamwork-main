const Notification = require("../models/Notification");
const { ioInstance } = require("../../server"); 

module.exports = async function sendNotification({ users, type, message, ticket, project }) {

    // DB ga yoziladi
    await Notification.insertMany(
        users.map(u => ({
            user: u,
            type,
            message,
            ticket,
            project
        }))
    );

    // **Realtime socket orqali yuborish**
    if (ioInstance) {
        users.forEach(u => {
            ioInstance.to(u.toString()).emit("notification", {
                type,
                message,
                ticket,
                project
            });
        });
    }

    return true;
};