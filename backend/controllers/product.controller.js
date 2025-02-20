import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) =>{
    try {
        const products = await Product.find({}); //find all product

        res.json({products})
    } catch (error) {
        console.log("err in get all prodcut controller", error.message);

        res.status(500).json({message:"server error", error:error.message});
    }
};

export const getFeaturedProducts = async (req,res) =>{
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }
            //if not in redis frtch from momgodb
        featuredProducts = await Product.find({isFeatured}).lean();
        
        

    } catch (error) {
        
    }
}