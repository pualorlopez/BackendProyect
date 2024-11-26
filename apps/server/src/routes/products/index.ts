import express, { Express } from "express";
import { ProductsService } from "../../services/ProductServices";
import { ProductController } from "../../controller/productController";

export function productRoute(app: Express): void {
    const router = express.Router();
    const service = new ProductsService() 
    const productController = new ProductController()
    app.use('/api/products', router)
    
    router.get('/', productController.getAllProducts);
    router.get('/:id',productController.getProductById);
  }