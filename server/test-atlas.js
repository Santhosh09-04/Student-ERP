require("dotenv").config()
const dns = require("dns")
try { dns.setServers(["8.8.8.8", "1.1.1.1"]) } catch (e) {}
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first")

const mongoose = require("mongoose")

async function testConnection() {
  const uri = process.env.MONGODB_URI
  console.log("Testing connection to MongoDB Atlas...")
  console.log("URI Target:", uri ? uri.replace(/:([^@]+)@/, ":****@") : "NONE")

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log("\n✅ SUCCESS: Successfully connected to MongoDB Atlas!")
    
    const db = mongoose.connection.db
    const stats = await db.stats()
    console.log(`Database Name: ${db.databaseName}`)
    console.log(`Collections Count: ${stats.collections}`)
    
    const collections = await db.listCollections().toArray()
    console.log("Existing Collections:", collections.map(c => c.name))
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error("\n❌ CONNECTION ERROR:", err.message)
    await mongoose.connection.close().catch(() => {})
    process.exit(1)
  }
}

testConnection()
