import mongoose from 'mongoose';
import initdata from './data.js';
import Product from '../models/products.js';
main()
.then(()=>{
    console.log("Mongodb Connection successfully");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/streetVendor');
}

const initdb=async()=>{
    await Product.deleteMany({});
    initdata.data= initdata.data.map((obj)=>({...obj,owner:'69f336fa9145e0c4c49c6081'}));
    await Product.insertMany(initdata.data);
    
    console.log("Data was saved successfully");
}
initdb();