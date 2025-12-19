import React from 'react';
import { handleBuy } from '../lib/stripe';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ThemeToggle from '../components/ThemeToggle';

const products = [
    {
        id: import.meta.env.VITE_STRIPE_PRODUCT_ID_1 || 'price_123',
        name: 'The Talk Merch T-Shirt',
        price: '25.00€',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        description: 'T-shirt officiel du podcast en coton bio.'
    },
    {
        id: import.meta.env.VITE_STRIPE_PRODUCT_ID_2 || 'price_456',
        name: 'Mug "Creative Mind"',
        price: '15.00€',
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80',
        description: 'Pour vos pauses café inspirantes.'
    }
];

export default function StorePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-[#007BFF] selection:text-white transition-colors duration-300">
            <Helmet>
                <title>Boutique | THE TALK</title>
                <meta name="description" content="Soutenez le podcast en achetant nos produits dérivés officiels." />
            </Helmet>

            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-[#007BFF] dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> Retour à l'accueil
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="pt-32 pb-24 px-6 container mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-[#007BFF]/10 rounded-full mb-4">
                        <ShoppingBag className="w-8 h-8 text-[#007BFF]" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-creativo font-bold mb-4">La Boutique</h1>
                    <p className="text-xl text-gray-500 dark:text-[#6C757D] font-minimal">Produits exclusifs pour la communauté.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {products.map((product) => (
                        <div key={product.id} className="group bg-gray-50 dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#333] hover:border-[#007BFF] transition-all hover:shadow-[0_0_20px_rgba(0,123,255,0.2)]">
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-creativo font-bold">{product.name}</h3>
                                    <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-sm font-bold ml-2">
                                        {product.price}
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-[#6C757D] font-minimal text-sm mb-6">
                                    {product.description}
                                </p>
                                <button
                                    onClick={() => handleBuy(product.id)}
                                    className="w-full bg-[#007BFF] hover:bg-[#0069d9] text-white py-3 rounded-xl font-bold font-creativo transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={18} />
                                    Acheter Maintenant
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
