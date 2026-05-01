import { supabase } from './supabase/client';

// ─── Certificate Service ───────────────────────────────────────────────────────
// Generates, stores, and downloads course completion certificates

interface CertificateData {
  id?: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  certificateNumber: string;
  issuedAt: string;
}

// Generate a unique certificate number
export const generateCertificateNumber = (): string => {
  const prefix = 'LN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Check if a certificate already exists for this user+course
export const getCertificate = async (userId: string, courseId: string): Promise<CertificateData | null> => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    userName: '',
    courseId: data.course_id,
    courseTitle: '',
    instructorName: '',
    certificateNumber: data.certificate_number,
    issuedAt: data.issued_at,
  };
};

// Issue a new certificate (stores in DB)
export const issueCertificate = async (userId: string, courseId: string): Promise<string> => {
  // Check if already exists
  const existing = await getCertificate(userId, courseId);
  if (existing) return existing.certificateNumber;

  const certificateNumber = generateCertificateNumber();
  const { error } = await supabase
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
      issued_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error issuing certificate:', error);
    throw new Error('Failed to issue certificate');
  }
  return certificateNumber;
};

// Get all certificates for a user
export const getUserCertificates = async (userId: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*, courses(title, instructor_name)')
    .eq('user_id', userId)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
  return data || [];
};

// ─── Canvas-based Certificate Generator ─────────────────────────────────────

export const downloadCertificate = (
  userName: string,
  courseTitle: string,
  instructorName: string,
  certificateNumber: string,
  issuedAt: string
) => {
  const canvas = document.createElement('canvas');
  const WIDTH = 1600;
  const HEIGHT = 1130;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Background ──
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, '#FAF9F7');
  bgGrad.addColorStop(1, '#F3F0EB');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── Decorative border ──
  ctx.strokeStyle = '#E8E4DD';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);

  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, WIDTH - 100, HEIGHT - 100);

  ctx.strokeStyle = '#E8E4DD';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, WIDTH - 120, HEIGHT - 120);

  // ── Corner ornaments ──
  const drawCorner = (x: number, y: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX, flipY);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 60);
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Small diamond
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(16, 0);
    ctx.lineTo(24, 8);
    ctx.lineTo(16, 16);
    ctx.closePath();
    ctx.fillStyle = '#7C3AED';
    ctx.fill();
    ctx.restore();
  };
  
  drawCorner(50, 50, 1, 1);
  drawCorner(WIDTH - 50, 50, -1, 1);
  drawCorner(50, HEIGHT - 50, 1, -1);
  drawCorner(WIDTH - 50, HEIGHT - 50, -1, -1);

  // ── Logo area ──
  // Graduation cap icon (simplified)
  const logoX = WIDTH / 2;
  const logoY = 130;
  
  ctx.beginPath();
  ctx.arc(logoX, logoY, 32, 0, Math.PI * 2);
  const capGrad = ctx.createLinearGradient(logoX - 32, logoY - 32, logoX + 32, logoY + 32);
  capGrad.addColorStop(0, '#7C3AED');
  capGrad.addColorStop(1, '#6D28D9');
  ctx.fillStyle = capGrad;
  ctx.fill();

  // Cap symbol
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎓', logoX, logoY + 8);
  
  // Brand name
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 22px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText('LearnNova', logoX, logoY + 62);

  // ── Thin separator ──
  const sepY = 210;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 100, sepY);
  ctx.lineTo(WIDTH / 2 + 100, sepY);
  ctx.strokeStyle = '#D4D0C8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Small diamond center
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, sepY - 5);
  ctx.lineTo(WIDTH / 2 + 5, sepY);
  ctx.lineTo(WIDTH / 2, sepY + 5);
  ctx.lineTo(WIDTH / 2 - 5, sepY);
  ctx.closePath();
  ctx.fillStyle = '#7C3AED';
  ctx.fill();

  // ── "Certificate of Completion" ──
  ctx.fillStyle = '#9B8E7E';
  ctx.font = '600 14px "Helvetica", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.textAlign = 'center';
  ctx.fillText('C E R T I F I C A T E   O F   C O M P L E T I O N', WIDTH / 2, 260);

  // ── "This is awarded to" ──
  ctx.fillStyle = '#A69B8D';
  ctx.font = '16px "Georgia", serif';
  ctx.fillText('This is proudly awarded to', WIDTH / 2, 330);

  // ── Recipient name ──
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'italic 52px "Georgia", serif';
  ctx.fillText(userName, WIDTH / 2, 410);

  // ── Name underline ──
  const nameWidth = Math.min(ctx.measureText(userName).width + 80, 700);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - nameWidth / 2, 430);
  ctx.lineTo(WIDTH / 2 + nameWidth / 2, 430);
  ctx.strokeStyle = '#D4D0C8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── "for successfully completing" ──
  ctx.fillStyle = '#A69B8D';
  ctx.font = '16px "Georgia", serif';
  ctx.fillText('for successfully completing the course', WIDTH / 2, 490);

  // ── Course title ──
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 36px "Helvetica", sans-serif';
  
  // Word wrap for long titles
  const maxTitleWidth = WIDTH - 300;
  const titleLines: string[] = [];
  const words = courseTitle.split(' ');
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxTitleWidth) {
      titleLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  titleLines.push(currentLine);
  
  let titleY = 550;
  for (const line of titleLines) {
    ctx.fillText(line, WIDTH / 2, titleY);
    titleY += 48;
  }

  // ── "taught by" ──
  const instructorY = titleY + 20;
  ctx.fillStyle = '#A69B8D';
  ctx.font = '15px "Georgia", serif';
  ctx.fillText('taught by', WIDTH / 2, instructorY);

  ctx.fillStyle = '#3A3A4A';
  ctx.font = 'bold 22px "Georgia", serif';
  ctx.fillText(instructorName, WIDTH / 2, instructorY + 35);

  // ── Decorative separator before footer ──
  const footSepY = HEIGHT - 260;
  ctx.beginPath();
  ctx.moveTo(200, footSepY);
  ctx.lineTo(WIDTH - 200, footSepY);
  ctx.strokeStyle = '#E8E4DD';
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Footer columns ──
  const footerY = HEIGHT - 200;
  
  // Date
  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 16px "Helvetica", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formattedDate, WIDTH / 4, footerY);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 4 - 80, footerY + 12);
  ctx.lineTo(WIDTH / 4 + 80, footerY + 12);
  ctx.strokeStyle = '#D4D0C8';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#9B8E7E';
  ctx.font = '12px "Helvetica", sans-serif';
  ctx.fillText('DATE OF ISSUE', WIDTH / 4, footerY + 32);

  // Certificate Number
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'bold 16px "Helvetica", sans-serif';
  ctx.fillText(certificateNumber, WIDTH / 2, footerY);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 80, footerY + 12);
  ctx.lineTo(WIDTH / 2 + 80, footerY + 12);
  ctx.strokeStyle = '#D4D0C8';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#9B8E7E';
  ctx.font = '12px "Helvetica", sans-serif';
  ctx.fillText('CERTIFICATE NO.', WIDTH / 2, footerY + 32);

  // Signature
  ctx.fillStyle = '#1A1A2E';
  ctx.font = 'italic 18px "Georgia", serif';
  ctx.fillText('LearnNova', (WIDTH / 4) * 3, footerY);
  ctx.beginPath();
  ctx.moveTo((WIDTH / 4) * 3 - 80, footerY + 12);
  ctx.lineTo((WIDTH / 4) * 3 + 80, footerY + 12);
  ctx.strokeStyle = '#D4D0C8';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#9B8E7E';
  ctx.font = '12px "Helvetica", sans-serif';
  ctx.fillText('AUTHORIZED BY', (WIDTH / 4) * 3, footerY + 32);

  // ── Bottom badge ──
  const badgeY = HEIGHT - 95;
  ctx.fillStyle = '#9B8E7E';
  ctx.font = '10px "Helvetica", sans-serif';
  ctx.fillText('Verify at learnnova.com/verify • This certificate confirms the successful completion of the above course.', WIDTH / 2, badgeY);

  // ── Download ──
  const link = document.createElement('a');
  link.download = `LearnNova-Certificate-${certificateNumber}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
};
