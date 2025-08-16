import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import Product from "@/Models/Product";
import ConnectDB from "@/config/db";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(req) {
    await ConnectDB();
    const data = await req.formData();
    const files = data.getAll('files');
    const images = [];

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({}, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }).end(buffer);
        });
        images.push(uploadResult.secure_url);
    }

    const productData = {
        name: data.get('name'),
        description: data.get('description'),
        category: data.get('category'),
        price: data.get('price'),
        offerPrice: data.get('offerPrice'),
        image: images
    };

    await Product.create(productData);

    return NextResponse.json({ success: true });
}
