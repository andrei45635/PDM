import WebSocket from "ws";
import jwt from "jsonwebtoken";
import {jwtConfig} from "./utils.js";

let wss;

export const initWss = value => {
    wss = value;
    wss.on("connection", ws => {
        ws.on("message", message => {
            const {type, payload: {token}} = JSON.parse(message);
            if (type !== "authorization") {
                ws.close();
                return;
            }
            try {
                ws.user = jwt.verify(token, jwtConfig.secret);
            } catch (err) {
                console.log("Unexpected error when authorizing the user");
                ws.close();
            }
        });
    });
};

export const broadcast = (userId, data) => {
    if (!wss) return;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && userId === client.user_id) {
            console.log(`broadcast sent to ${client.user.username}`);
            client.send(JSON.stringify(data));
        }
    });
};