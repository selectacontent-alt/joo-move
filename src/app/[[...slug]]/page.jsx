import App from '../../App';
import { getPool } from '@/lib/db';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  
  try {
    const pool = await getPool();
    
    if (slug[0] === 'product' && slug[1]) {
      const decodedSlug = decodeURIComponent(slug[1]);
      let [rows] = await pool.query('SELECT title, description, image FROM products WHERE REPLACE(title, " ", "-") = ? LIMIT 1', [decodedSlug]);
      
      if (!rows || rows.length === 0) {
        const lastDash = decodedSlug.lastIndexOf('-');
        if (lastDash !== -1) {
          const productIdStr = decodedSlug.substring(lastDash + 1);
          [rows] = await pool.query('SELECT title, description, image FROM products WHERE id = ? LIMIT 1', [productIdStr]);
        }
      }
      
      if (rows && rows.length > 0) {
        const product = rows[0];
        const imageUrl = product.image 
          ? (product.image.startsWith('http') ? product.image : `https://Al Rehab.com${product.image.startsWith('/') ? '' : '/'}${product.image}`)
          : 'https://Al Rehab.com/logo.png';
          
        return {
          title: product.title,
          description: product.description || 'تسوق الآن من متجر الرحاب',
          openGraph: {
            title: product.title,
            description: product.description || 'تسوق الآن من متجر الرحاب',
            images: [
              {
                url: imageUrl,
                secureUrl: imageUrl,
                width: 800,
                height: 800,
                alt: product.title,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description || 'تسوق الآن من متجر الرحاب',
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }

  return {};
}

export default async function Page(props) {
  const resolvedParams = await props.params;
  const slug = resolvedParams?.slug || [];
  let jsonLd = null;

  try {
    const pool = await getPool();
    if (slug[0] === 'product' && slug[1]) {
      const decodedSlug = decodeURIComponent(slug[1]);
      let [rows] = await pool.query('SELECT * FROM products WHERE REPLACE(title, " ", "-") = ? LIMIT 1', [decodedSlug]);
      
      if (!rows || rows.length === 0) {
        const lastDash = decodedSlug.lastIndexOf('-');
        if (lastDash !== -1) {
          const productIdStr = decodedSlug.substring(lastDash + 1);
          [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [productIdStr]);
        }
      }
      if (rows && rows.length > 0) {
        const product = rows[0];
        const imageUrl = product.image 
          ? (product.image.startsWith('http') ? product.image : `https://Al Rehab.com${product.image.startsWith('/') ? '' : '/'}${product.image}`)
          : 'https://Al Rehab.com/logo.png';
        
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          image: imageUrl,
          description: product.description || 'تسوق الآن من متجر الرحاب',
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EGP',
            availability: (product.stock === undefined || product.stock === null || Number(product.stock) > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `https://Al Rehab.com/product/${encodeURIComponent(product.title.replace(/\\s+/g, '-'))}`
          }
        };
        if (product.old_price && Number(product.old_price) > Number(product.price)) {
          // If there's an offer
        }
      }
    } else {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'الرحاب - Al Rehab',
        url: 'https://Al Rehab.com',
        logo: 'https://Al Rehab.com/logo.png',
        description: 'متجر الرحاب - أحدث صيحات الموضة وملابس الأطفال الراقية بجودة عالية وأسعار مميزة.',
      };
    }
  } catch (error) {
    console.error('Error generating JSON-LD:', error);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <App />
    </>
  );
}
