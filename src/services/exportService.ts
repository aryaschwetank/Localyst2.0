import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StoreDocument } from './firestore';

export async function exportStoreToPDF(store: StoreDocument): Promise<void> {
  try {
    // Create a temporary div with store content
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';

    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">${store.businessName}</h1>
        <p style="color: #6b7280; font-size: 18px;">${store.businessType} • ${store.location}</p>
        <p style="color: #8b5cf6; font-weight: bold; font-style: italic;">"${store.tagline || 'Quality Service Always'}"</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">About Us</h2>
        <p style="color: #4b5563; line-height: 1.6;">${store.description}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">Our Services</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
          ${store.services.map(service => `
            <div style="background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center;">
              <span style="color: #374151; font-weight: 500;">${service}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 25px;">
        <div>
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">💰 Pricing</h2>
          ${(store.pricingSuggestions || []).map(price => `
            <div style="background: #ecfdf5; padding: 8px; margin: 5px 0; border-radius: 6px; border-left: 4px solid #10b981;">
              <span style="color: #047857;">${price}</span>
            </div>
          `).join('')}
        </div>

        <div>
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">📋 Our Policies</h2>
          ${(store.policies || []).map(policy => `
            <div style="margin: 8px 0; display: flex; align-items: start;">
              <span style="color: #10b981; margin-right: 8px; margin-top: 2px;">✓</span>
              <span style="color: #374151;">${policy}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <h2 style="margin-bottom: 10px;">🎉 Special Offer</h2>
        <p style="font-size: 16px;">${store.marketingContent || 'Visit us for quality service!'}</p>
      </div>

      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-bottom: 15px;">📞 Contact Information</h2>
        <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 10px;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 18px; margin-right: 10px;">📞</span>
            <span style="color: #374151;">${store.phone}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="font-size: 18px; margin-right: 10px;">🕒</span>
            <span style="color: #374151;">${store.hours}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="font-size: 18px; margin-right: 10px;">📍</span>
            <span style="color: #374151;">${store.location}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Created with ❤️ using Localyst AI</p>
        <p style="color: #9ca3af; font-size: 12px;">Visit: ${window.location.origin}/store/${store.storeSlug}</p>
      </div>
    `;

    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Remove temp div
    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${store.businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_store_info.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}

export async function exportStoreAsImage(store: StoreDocument): Promise<void> {
  try {
    // Similar implementation to PDF but for image export
    console.log('Exporting store as image:', store.businessName);
    alert('Image export feature coming soon!');
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
  }
}