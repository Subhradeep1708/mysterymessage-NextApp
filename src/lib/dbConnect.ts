import mongoose from "mongoose";

//db se after connection jo object aata hai woh check
type ConnectionObject = {
    isConnected?: number //"?" means optional||":number" means if comes it will be a number 
}

const connection: ConnectionObject = {}  


// database connection
async function dbConnect(): Promise<void> {
    //multiple times db connect na ho jisse performance could choke
    if (connection.isConnected) {
        console.log("Already connected to database");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        console.log(db);


        connection.isConnected = db.connections[0].readyState

        console.log("DB Connected Succesfully");

    } catch (error) {
        console.log("Database connection failed", error);

        process.exit(1)
    }
}

export default dbConnect;