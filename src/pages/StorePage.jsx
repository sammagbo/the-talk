import React, { useState, useEffect } from 'react';
import { handleBuy } from '../lib/stripe';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ThemeToggle from '../components/ThemeToggle';
import { client, urlFor } from '../sanity';
import { PLACEHOLDER_IMAGE } from '../config/media';
import { useTranslation } from 'react-i18next';

export default function StorePage() {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const query = `*[_type == "product"] | order(_createdAt desc) {
                    _id,
                    title,
                    price,
                    description,
                    stripePriceId,
                    "imageUrl": image.asset->url
                }`;
                const data = await client.fetch(query);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white transition-colors duration-300">
            <Helmet>
                <title>Boutique | THE TALK</title>
                <meta name="description" content="Soutenez le podcast en achetant nos produits dérivés officiels." />
            </Helmet>

            <nav className="fixed w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] py-4">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-[#6C757D] hover:text-black hover:dark:text-white dark:hover:text-white transition-colors font-minimal text-sm uppercase tracking-wider">
                        <ArrowLeft size={16} /> {t('store.back')}
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <div className="pt-32 pb-24 px-6 container mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-black/10 dark:bg-white/10 rounded-none mb-4">
                        <ShoppingBag className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-creativo font-bold mb-4">{t('store.title')}</h1>
                    <p className="text-xl text-gray-500 dark:text-[#6C757D] font-minimal">{t('store.description')}</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-black dark:text-white animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-[#6C757D] font-minimal text-lg">{t('store.no_products')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {products.map((product) => (
                            <div key={product._id} className="group bg-gray-50 dark:bg-[#111] rounded-none overflow-hidden border border-gray-200 dark:border-[#333] hover:border-black hover:dark:border-white transition-all">
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={product.imageUrl ? urlFor(product.imageUrl).width(800).url() : PLACEHOLDER_IMAGE}
                                        alt={product.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-creativo font-bold">{product.title}</h3>
                                        <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-none text-sm font-bold ml-2">
                                            {product.price?.toFixed(2)}€
                                        </span>
                                    </div>
                                    <p className="text-gray-500 dark:text-[#6C757D] font-minimal text-sm mb-6">
                                        {product.description}
                                    </p>
                                    <button
                                        onClick={() => handleBuy(product.stripePriceId)}
                                        disabled={!product.stripePriceId}
                                        className="w-full bg-black dark:bg-white hover:bg-gray-800 hover:dark:bg-gray-300 text-white dark:text-black py-3 rounded-none font-bold font-creativo transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingBag size={18} />
                                        {t('store.buy')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

