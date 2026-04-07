import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  Check,
  Star,
  Trash2,
  User,
  ShoppingBag,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../context/AppContext";
import { FirestoreService } from "../services/FirestoreService";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    addToCart,
    formatPrice,
    calculateFinalPrice,
    isOnSale,
    getSaleForProduct,
    settings,
    user,
    isAdmin,
  } = useAppContext();
  const { t } = useTranslation();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onSale = product ? isOnSale(product.id?.toString() || "") : false;
  const finalPrice = product ? calculateFinalPrice(product) : 0;
  const activeSale = product
    ? getSaleForProduct(product.id?.toString() || "")
    : null;

  const stock = product?.stock ?? 0;
  const minThreshold = parseInt(settings?.minStockThreshold || "5");
  const highThreshold = parseInt(settings?.highStockThreshold || "50");

  const isLowStock = stock > 0 && stock <= minThreshold;
  const isOutStock = stock <= 0;
  const isHighStock = stock >= highThreshold;

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        const data = (await FirestoreService.getDocument(
          "products",
          id,
        )) as any;
        if (data) {
          setProduct(data);
          setSelectedColor(data.colors?.[0]?.name || null);

          // Fetch reviews
          const productReviews = await FirestoreService.getProductReviews(id);
          setReviews(productReviews);
        }
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (activeSale && activeSale.endDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(activeSale.endDate).getTime();
        const distance = end - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeLeft(null);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60),
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeSale]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-velmora-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-velmora-500 dark:text-velmora-400 font-bold uppercase tracking-widest text-xs">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">
          {t("product.notFound")}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-velmora-900 dark:text-white underline font-bold"
        >
          {t("product.returnToShop")}
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError(t("product.selectSizeAlert"));
      setTimeout(() => setError(null), 3000);
      return;
    }
    addToCart(product, selectedSize, selectedColor || undefined);
  };

  const handleBuyNow = () => {
    const stock = product.stock ?? 0;
    if (stock <= 0) {
      alert(
        t("common.outOfStockAlert") ||
          "This product is currently out of stock.",
      );
      return;
    }
    if (!selectedSize) {
      setError(t("product.selectSizeAlert"));
      setTimeout(() => setError(null), 3000);
      return;
    }
    navigate("/checkout", { state: { product, selectedSize, selectedColor } });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      await FirestoreService.addReview({
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "User",
        rating: newRating,
        comment: newComment,
      });

      setNewRating(5);
      setNewComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);

      // Refresh reviews
      const productReviews = await FirestoreService.getProductReviews(id);
      setReviews(productReviews);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(t("product.reviewError"));
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await FirestoreService.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      setDeletingId(null);
      toast.success(
        t("product.reviewDeleted") || "Review deleted successfully",
      );
    } catch (err) {
      console.error("Error deleting review:", err);
      setDeletingId(null);
      toast.error(t("product.deleteReviewError") || "Failed to delete review");
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="pt-24 pb-24 bg-white dark:bg-zinc-950 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Top Navigation / Breadcrumbs */}
        <div className="mb-16 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-8">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate(-1)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="text-lg">←</span> {t("common.back")}
            </button>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
              <span>{t("nav.home")}</span>
              <span>/</span>
              <span>{product.category}</span>
              <span>/</span>
              <span className="text-zinc-900 dark:text-white">
                {product.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={handleShare}
              className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              {t("SHARE")}
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                isWishlisted
                  ? "text-red-500"
                  : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
              )}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  isWishlisted && "fill-current",
                )}
              />
              {isWishlisted ? t("SAVED") : t("common.save")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* Image Gallery - Dynamic Editorial Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {(product.images && product.images.length > 0
                ? product.images
                : [product.image]
              )
                .filter(Boolean)
                .map((img: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      delay: index * 0.1,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                    className={cn(
                      "relative overflow-hidden group bg-zinc-50 dark:bg-zinc-900/30",
                      index === 0
                        ? "md:col-span-2 aspect-[16/10]"
                        : "aspect-[4/5]",
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Product Info - Refined & Organized */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <div className="space-y-16">
              {/* Header: Title, SKU, Price */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                      SKU: VEL-{product.id?.toString().slice(-6).toUpperCase()}
                    </span>
                    {onSale && (
                      <span className="bg-red-600 text-white text-[8px] font-bold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full">
                        {t("SALE")}
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full ring-4 ring-offset-0",
                          isOutStock
                            ? "bg-red-500 ring-red-500/10"
                            : isLowStock
                              ? "bg-amber-500 ring-amber-500/10"
                              : "bg-emerald-500 ring-emerald-500/10",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em]",
                          isOutStock
                            ? "text-red-500"
                            : isLowStock
                              ? "text-amber-500"
                              : "text-emerald-500",
                        )}
                      >
                        {isOutStock
                          ? t("OUT OF STOCK")
                          : isLowStock
                            ? `${t("product.only")} ${stock} ${t("product.left")}`
                            : t("IN stock")}
                      </span>
                    </div>
                  </div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl xl:text-7xl font-display font-bold leading-[0.95] dark:text-white tracking-tighter"
                  >
                    {product.name}
                  </motion.h1>
                </div>

                <div className="flex items-end gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block">
                      {t("price")}
                    </span>
                    <div className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          "text-4xl font-bold font-mono tracking-tighter",
                          onSale
                            ? "text-red-600"
                            : "text-zinc-900 dark:text-white",
                        )}
                      >
                        {formatPrice(finalPrice)}
                      </span>
                      {onSale && (
                        <span className="text-xl font-mono text-zinc-300 dark:text-zinc-700 line-through tracking-tighter">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  {onSale && activeSale && (
                    <div className="pb-1">
                      <span className="text-red-600 text-[10px] font-bold uppercase tracking-[0.2em] border border-red-200 dark:border-red-900/30 px-3 py-1 rounded-full">
                        {activeSale.discountType === "percentage"
                          ? `${activeSale.discount}% OFF`
                          : `${activeSale.discount} EGP OFF`}
                      </span>
                    </div>
                  )}
                </div>

                {onSale && timeLeft && (
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-red-50 dark:bg-red-950/20 rounded-full border border-red-100 dark:border-red-900/20">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-red-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                      {t("LIMITED OFFER")}: {timeLeft}
                    </span>
                  </div>
                )}
              </div>

              {/* Description & Story */}
              <div className="space-y-8 pt-12 border-t border-zinc-100 dark:border-white/5">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                    {t("Product Story")}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-lg font-light italic font-display">
                    "A piece designed for those who appreciate the finer details
                    of modern elegance. Crafted with precision and passion."
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="space-y-12 pt-12 border-t border-zinc-100 dark:border-white/5">
                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        {t("product.color")} —{" "}
                        <span className="text-zinc-900 dark:text-white">
                          {selectedColor}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-5">
                      {(product.colors || []).map((color: any) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={cn(
                            "group relative w-10 h-10 rounded-full transition-all duration-700",
                            selectedColor === color.name
                              ? "scale-110"
                              : "hover:scale-105",
                          )}
                        >
                          <div
                            className="w-full h-full rounded-full shadow-sm border border-black/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          {selectedColor === color.name && (
                            <motion.div
                              layoutId="color-ring"
                              className="absolute -inset-2 rounded-full border border-zinc-900 dark:border-white"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      {t("product.selectSize")}
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b border-zinc-900 dark:border-white pb-0.5"
                    >
                      {t("product.sizeGuide")}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {(product.sizes || []).map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "h-14 flex items-center justify-center text-[11px] font-bold transition-all duration-500 rounded-sm border",
                          selectedSize === size
                            ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black"
                            : "border-zinc-100 dark:border-white/5 text-zinc-400 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-8">
                <div className="relative">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-12 left-0 right-0 text-center"
                      >
                        <span className="bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-sm shadow-2xl">
                          {error}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleAddToCart}
                    disabled={isOutStock}
                    className={cn(
                      "w-full h-16 flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-700 rounded-sm",
                      isOutStock
                        ? "bg-zinc-50 dark:bg-white/5 text-zinc-300 dark:text-white/10 cursor-not-allowed"
                        : "bg-white dark:bg-transparent border border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black",
                    )}
                  >
                    {isOutStock ? t("OUT OF STOCK") : t("product.addToCart")}
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutStock}
                  className={cn(
                    "w-full h-16 flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.4em] transition-all duration-700 rounded-sm",
                    isOutStock
                      ? "bg-zinc-100 dark:bg-white/10 text-zinc-400 dark:text-white/20 cursor-not-allowed"
                      : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xl shadow-black/10 dark:shadow-white/5",
                  )}
                >
                  {isOutStock ? t("OUT OF STOCK") : t("product.buyNow")}
                </button>
              </div>

              {/* Trust Badges - Minimalist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-100 dark:border-white/5">
                    <Truck className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-tight">
                    {t("product.freeExpressShipping")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-100 dark:border-white/5">
                    <RotateCcw className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-tight">
                    {t("returns 14 Days")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-100 dark:border-white/5">
                    <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-tight">
                    {t("product.securePayment")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Care - Full Width Editorial Section */}
        <div className="mt-40 relative overflow-hidden bg-[#FDFDFC] dark:bg-zinc-900/10 rounded-[2.5rem] p-12 lg:p-24 border border-zinc-100 dark:border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100/50 dark:bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block">
                  01 / {t("product.details")}
                </span>
                <h2 className="text-5xl lg:text-6xl font-display font-bold dark:text-white leading-[1.1] tracking-tight">
                  {t("product.compositionCare")}
                </h2>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-xl font-light max-w-md italic font-display">
                "Our garments are designed to last. We use only the highest
                quality materials and ethical manufacturing processes."
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
              {(product.details || []).map((detail: string, i: number) => (
                <div key={i} className="group space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-[1px] bg-zinc-900 dark:bg-white transition-all group-hover:w-16" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section - Editorial Guestbook Style */}
        <div className="mt-24 relative overflow-hidden bg-[#FAFAFA] dark:bg-zinc-900/5 rounded-[2.5rem] p-12 lg:p-24 border border-zinc-100 dark:border-white/5">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-100/30 dark:bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <div className="relative max-w-5xl mx-auto space-y-32">
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div className="space-y-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                  02 / {t("feedback")}
                </span>
                <h2 className="text-6xl font-display font-bold dark:text-white leading-tight">
                  {t("product.reviews")}
                </h2>
              </div>
              <div className="flex items-center gap-12 pb-2">
                <div className="space-y-1">
                  <div className="text-6xl font-bold font-mono tracking-tighter dark:text-white">
                    {averageRating.toFixed(1)}
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    {t("product.averageRating")}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= Math.round(averageRating)
                            ? "fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white"
                            : "text-zinc-100 dark:text-zinc-800",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                    {t("product.basedOn", { count: reviews.length })}
                  </p>
                </div>
              </div>
            </div>

            {/* Review List & Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
              {/* Review List */}
              <div className="lg:col-span-7 space-y-20">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="group space-y-8 border-b border-zinc-100 dark:border-white/5 pb-16 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "w-3 h-3",
                                  star <= review.rating
                                    ? "fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white"
                                    : "text-zinc-100 dark:text-zinc-800",
                                )}
                              />
                            ))}
                          </div>
                          <h4 className="text-xl font-display font-bold dark:text-white italic">
                            "{review.comment}"
                          </h4>
                        </div>
                        {(isAdmin || (user && user.uid === review.userId)) && (
                          <button
                            onClick={() => setDeletingId(review.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold dark:text-white">
                            {review.userName}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                          <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                            {new Date(review.createdAt).toLocaleDateString(
                              undefined,
                              { month: "long", year: "numeric" },
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center border border-dashed border-zinc-100 dark:border-white/5 rounded-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300">
                      {t("no Reviews Yet")}
                    </p>
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-32 bg-zinc-50 dark:bg-zinc-900/30 p-10 rounded-sm border border-zinc-100 dark:border-white/5">
                  <div className="space-y-10">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold dark:text-white">
                        {t("product.writeReview")}
                      </h3>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                        {t("share Your Experience")}
                      </p>
                    </div>

                    {user ? (
                      <form onSubmit={handleSubmitReview} className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            {t("product.yourRating")}
                          </label>
                          <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="transition-transform hover:scale-125"
                              >
                                <Star
                                  className={cn(
                                    "w-6 h-6",
                                    star <= newRating
                                      ? "fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white"
                                      : "text-zinc-200 dark:text-zinc-800",
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            {t("product.yourComment")}
                          </label>
                          <textarea
                            required
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-white/5 rounded-sm p-5 text-[13px] focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all dark:text-white min-h-[120px] leading-relaxed"
                            placeholder={t("COMMENT....")}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {isSubmitting
                            ? t("common.loading")
                            : t("product.submitReview")}
                        </button>

                        {reviewSuccess && (
                          <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-bold text-emerald-600 text-center uppercase tracking-[0.2em]"
                          >
                            {t("product.reviewSuccess")}
                          </motion.p>
                        )}
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {t("product.loginToReview")}
                        </p>
                        <button
                          onClick={() => navigate("/login")}
                          className="w-full h-14 border border-zinc-900 dark:border-white text-zinc-900 dark:text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                        >
                          {t("LOGIN")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-zinc-900 z-[210] p-10 rounded-sm shadow-2xl"
            >
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-6 right-6 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-display font-bold mb-8 dark:text-white tracking-tight">
                {t("product.sizeGuide").toUpperCase()}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-white/10">
                      <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-white">
                        {t("product.size")}
                      </th>
                      <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-white">
                        {t("product.bust")} (cm)
                      </th>
                      <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-white">
                        {t("product.waist")} (cm)
                      </th>
                      <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-white">
                        {t("product.hips")} (cm)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { s: "XS", b: "82-86", w: "62-66", h: "88-92" },
                      { s: "S", b: "86-90", w: "66-70", h: "92-96" },
                      { s: "M", b: "90-94", w: "70-74", h: "96-100" },
                      { s: "L", b: "94-98", w: "74-78", h: "100-104" },
                      { s: "XL", b: "98-102", w: "78-82", h: "104-108" },
                    ].map((row) => (
                      <tr
                        key={row.s}
                        className="border-b border-zinc-50 dark:border-white/5"
                      >
                        <td className="py-4 text-[13px] font-bold dark:text-white">
                          {row.s}
                        </td>
                        <td className="py-4 text-[13px] text-zinc-500 dark:text-zinc-400">
                          {row.b}
                        </td>
                        <td className="py-4 text-[13px] text-zinc-500 dark:text-zinc-400">
                          {row.w}
                        </td>
                        <td className="py-4 text-[13px] text-zinc-500 dark:text-zinc-400">
                          {row.h}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-8 text-[11px] text-zinc-400 italic">
                {t("product.measurementsNote")}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-8 py-4 rounded-sm shadow-2xl z-[300] flex items-center space-x-3"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {t("product.linkCopied")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Review Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 z-[210] p-10 rounded-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-display font-bold mb-4 dark:text-white">
                {t("product.confirmDeleteReview") || "Delete Review?"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
                {t("product.confirmDeleteReviewDesc") ||
                  "Are you sure you want to delete this review? This action cannot be undone."}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteReview(deletingId)}
                  className="flex-1 bg-red-500 text-white py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  {t("common.delete") || "Delete"}
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-4 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
