import { useEffect } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  Database,
  Eye,
  FileCheck2,
  HeartPulse,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Brand } from "../../../shared/components/Brand";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import { normalizeLanguage } from "../../../shared/i18n/i18n";

const policyContent = {
  ar: {
    language: "العربية",
    dir: "rtl",
    locale: "ar-SY",
    title: "سياسة الخصوصية",
    eyebrow: "خصوصيتك جزء من رعايتك",
    intro:
      "توضح هذه السياسة كيف تجمع منصة دوائي بياناتك وتستخدمها وتحميها عند استعمال الموقع وخدماته. صيغت بلغة واضحة لتعرف دائمًا ما الذي يحدث لمعلوماتك.",
    effectiveLabel: "آخر تحديث",
    effectiveDate: "14 أغسطس 2026",
    summaryTitle: "الخلاصة",
    summary:
      "نستخدم أقل قدر لازم من البيانات لتقديم الخدمة، ولا نبيع معلوماتك الشخصية أو الصحية، ولا نستخدمها للإعلانات الموجّهة.",
    tocTitle: "محتويات السياسة",
    home: "الرئيسية",
    back: "العودة للرئيسية",
    login: "تسجيل الدخول",
    sections: [
      {
        id: "scope",
        title: "من نحن ونطاق السياسة",
        icon: ShieldCheck,
        paragraphs: [
          "دوائي منصة رقمية تربط المستخدمين بالصيدليات والمنظمات والجهات المشاركة في سلسلة توريد الدواء، وتوفر خدمات البحث والطلبات والتبرعات والمساعدة الصحية.",
          "تنطبق هذه السياسة على الموقع والحسابات والخدمات المرتبطة به. عند انتقالك إلى خدمة خارجية من خلال رابط في المنصة، تخضع تلك الخدمة لسياستها الخاصة.",
        ],
      },
      {
        id: "data",
        title: "البيانات التي نعالجها",
        icon: Database,
        groups: [
          {
            title: "بيانات الحساب والهوية",
            text: "الاسم، البريد الإلكتروني، رقم الهاتف، صورة الحساب، نوع الحساب، وبيانات التحقق اللازمة للصيدليات والمنظمات والجهات المهنية.",
            icon: UserRound,
          },
          {
            title: "البيانات الصحية والدوائية",
            text: "الملف الطبي الذي تدخله، الحساسية والأمراض المزمنة والأدوية الحالية والوصفات وطلبات الأدوية وسجل البحث، عندما تختار استخدام هذه الخدمات.",
            icon: HeartPulse,
          },
          {
            title: "بيانات الموقع",
            text: "موقعك عند السماح به للعثور على الصيدليات القريبة وإظهار المسار، أو موقع المنشأة الذي يدخله صاحبها. لا يتتبع الموقع موقع المستخدم في الخلفية.",
            icon: MapPin,
          },
          {
            title: "الملفات والمحتوى",
            text: "الصور والوثائق التي ترفعها، مثل صورة الحساب أو الوصفة أو وثائق الترخيص والتحقق، إضافة إلى الملاحظات والتقييمات والمحادثات التي تنشئها.",
            icon: FileCheck2,
          },
          {
            title: "بيانات الاستخدام التقنية",
            text: "معلومات الجلسة، عنوان الشبكة، نوع المتصفح، سجلات الأخطاء والطلبات، ومعرّف زيارة غير مباشر يساعد في تشغيل المنصة وقياس استخدامها الأساسي.",
            icon: Activity,
          },
        ],
      },
      {
        id: "purpose",
        title: "لماذا نستخدم البيانات؟",
        icon: SlidersHorizontal,
        bullets: [
          "إنشاء الحساب والتحقق منه وإدارة الصلاحيات بحسب نوعه.",
          "البحث عن الأدوية والصيدليات، تقدير القرب، وعرض مسار الوصول.",
          "إرسال طلبات الأدوية ومتابعتها وإتاحة التقييمات والتبرعات وطلبات المساعدة.",
          "عرض الملف الصحي والوصفات والتنبيهات والخدمات التي يطلبها المستخدم.",
          "التحقق من تراخيص الصيدليات ووثائق المنظمات ومراجعة الحسابات المهنية.",
          "حماية الحسابات ومنع إساءة الاستخدام وتشخيص الأخطاء وتحسين الأداء.",
          "تنفيذ الالتزامات النظامية والاحتفاظ بالسجلات المطلوبة عند الضرورة.",
        ],
      },
      {
        id: "ai",
        title: "الخدمات الذكية",
        icon: Bot,
        paragraphs: [
          "عند استخدام البحث الذكي أو تحليل الوصفات أو المحادثة أو التحقق المساند من الوثائق، تُرسل المدخلات التي اخترتها إلى خوادم دوائي والخدمات التقنية اللازمة لإنتاج النتيجة.",
          "المخرجات الذكية إرشادية ومساندة وليست تشخيصًا طبيًا أو بديلًا عن الطبيب أو الصيدلي. لا تستخدم هذه المدخلات لغرض إعلاني.",
        ],
      },
      {
        id: "sharing",
        title: "متى تُشارك البيانات؟",
        icon: Eye,
        paragraphs: [
          "لا نبيع بياناتك. قد نعرض أو نرسل القدر اللازم منها إلى الصيدلية أو المنظمة أو الجهة المعنية لتنفيذ طلب بدأته أنت، مثل بيانات طلب دواء أو تبرع.",
          "قد نستعين بمزودي الاستضافة والخرائط والأماكن ومعالجة الملفات والخدمات الذكية لتشغيل الميزة المطلوبة. يحصل كل مزود على البيانات اللازمة لخدمته فقط ووفق ضوابطه والتزامات الحماية المعمول بها.",
          "قد نكشف عن بيانات عندما يفرض القانون ذلك، أو لحماية المستخدمين والمنصة من الاحتيال أو الخطر، وبالقدر اللازم فقط.",
        ],
      },
      {
        id: "storage",
        title: "التخزين ومدة الاحتفاظ",
        icon: Database,
        paragraphs: [
          "يستخدم الموقع تخزين المتصفح لحفظ جلسة الدخول، واللغة المختارة، وبعض التفضيلات الضرورية. لا نستخدم هذه البيانات لبناء ملف إعلاني عنك.",
          "نحتفظ بالبيانات ما دام الحساب فعالًا أو ما دامت مطلوبة لتقديم الخدمة. قد تبقى بعض السجلات لفترة إضافية عند وجود التزام قانوني أو مالي أو أمني، ثم تُحذف أو تُفصل عن هوية صاحبها متى انتفت الحاجة إليها.",
        ],
      },
      {
        id: "security",
        title: "كيف نحمي معلوماتك؟",
        icon: LockKeyhole,
        paragraphs: [
          "نطبق صلاحيات بحسب نوع الحساب، وتحققًا من الهوية للعمليات المحمية، وضوابط للوصول إلى الملفات والبيانات الحساسة، ونستخدم اتصالًا مشفرًا عند نشر الخدمة في بيئة الإنتاج.",
          "لا توجد وسيلة إلكترونية تضمن حماية مطلقة؛ لذلك نراجع الضوابط باستمرار وننصحك بكلمة مرور قوية وعدم مشاركة بيانات الدخول أو ترك حسابك مفتوحًا على جهاز مشترك.",
        ],
      },
      {
        id: "rights",
        title: "خياراتك وحقوقك",
        icon: SlidersHorizontal,
        bullets: [
          "مراجعة بيانات حسابك وتحديث البيانات القابلة للتعديل.",
          "رفض إذن الموقع أو الكاميرا أو الملفات؛ وقد تتوقف الميزة التي تعتمد على الإذن فقط.",
          "طلب تصحيح بيانات غير دقيقة أو طلب حذف الحساب والبيانات المرتبطة به.",
          "إلغاء الطلبات أو حذف سجل البحث حيث تتيح المنصة ذلك.",
          "الاعتراض أو الاستفسار عن معالجة محددة عبر قناة التواصل الرسمية.",
        ],
        note: "قد نطلب التحقق من الهوية قبل تنفيذ طلب يتعلق بالبيانات، وقد نستثني ما يجب الاحتفاظ به نظاميًا أو لحماية الحقوق ومنع الاحتيال.",
      },
      {
        id: "children",
        title: "خصوصية الأطفال",
        icon: UserRound,
        paragraphs: [
          "المنصة ليست موجهة للأطفال لاستخدامها بصورة مستقلة. ينبغي لولي الأمر أو المسؤول القانوني الإشراف على إدخال بيانات القاصر واستخدام الخدمات الصحية نيابة عنه حيث يلزم.",
        ],
      },
      {
        id: "updates",
        title: "تحديث السياسة",
        icon: FileCheck2,
        paragraphs: [
          "قد نحدّث هذه السياسة عند تطوير الخدمات أو تغير المتطلبات. سنعرض النسخة الجديدة في هذه الصفحة ونحدّث تاريخها، وسنقدم إشعارًا أوضح إذا كان التغيير جوهريًا.",
        ],
      },
      {
        id: "contact",
        title: "التواصل بشأن الخصوصية",
        icon: Mail,
        paragraphs: [
          "للاستفسار عن الخصوصية أو تقديم طلب متعلق ببياناتك، استخدم بريد الخصوصية الظاهر أدناه إن كان متاحًا، أو قناة التواصل الرسمية المدرجة ضمن بيانات دوائي عند نشر الخدمة.",
        ],
      },
    ],
    footer: "دوائي — رعاية أقرب، ومعلومة أوضح.",
  },
  en: {
    language: "English",
    dir: "ltr",
    locale: "en-US",
    title: "Privacy Policy",
    eyebrow: "Your privacy is part of your care",
    intro:
      "This policy explains how Dawaai collects, uses, and protects your information when you use the website and its services. It is written clearly so you can understand what happens to your data.",
    effectiveLabel: "Last updated",
    effectiveDate: "August 14, 2026",
    summaryTitle: "In brief",
    summary:
      "We use only the data needed to provide the service. We do not sell personal or health information, and we do not use it for targeted advertising.",
    tocTitle: "On this page",
    home: "Home",
    back: "Back to home",
    login: "Sign in",
    sections: [
      {
        id: "scope",
        title: "Who we are and scope",
        icon: ShieldCheck,
        paragraphs: [
          "Dawaai is a digital platform connecting users with pharmacies, organizations, and participants in the medicine supply chain. It provides medicine search, requests, donations, and health-support services.",
          "This policy applies to the website, accounts, and connected services. External services opened through a link are governed by their own privacy policies.",
        ],
      },
      {
        id: "data",
        title: "Data we process",
        icon: Database,
        groups: [
          {
            title: "Account and identity",
            text: "Name, email, phone number, profile image, account role, and verification details required for professional accounts.",
            icon: UserRound,
          },
          {
            title: "Health and medicine data",
            text: "Medical profile details you provide, allergies, chronic conditions, current medicines, prescriptions, medicine requests, and search history when you use those features.",
            icon: HeartPulse,
          },
          {
            title: "Location",
            text: "Your location, with permission, to find nearby pharmacies and display routes, or a facility location entered by its owner. We do not track user location in the background.",
            icon: MapPin,
          },
          {
            title: "Files and content",
            text: "Images and documents you upload, such as a profile image, prescription, license, or verification document, plus notes, ratings, and chats you create.",
            icon: FileCheck2,
          },
          {
            title: "Technical usage data",
            text: "Session information, network address, browser type, error and request logs, and an indirect visit identifier used to operate the platform and measure basic usage.",
            icon: Activity,
          },
        ],
      },
      {
        id: "purpose",
        title: "Why we use data",
        icon: SlidersHorizontal,
        bullets: [
          "Create and verify accounts and manage role-based access.",
          "Search for medicines and pharmacies, estimate proximity, and show routes.",
          "Create and track medicine requests, ratings, donations, and assistance requests.",
          "Provide health profiles, prescriptions, notifications, and requested services.",
          "Review pharmacy licenses, organization documents, and professional accounts.",
          "Protect accounts, prevent abuse, diagnose errors, and improve performance.",
          "Meet legal obligations and retain required records where necessary.",
        ],
      },
      {
        id: "ai",
        title: "Smart services",
        icon: Bot,
        paragraphs: [
          "When you use smart search, prescription analysis, chat, or document-assisted verification, the input you choose is sent to Dawaai servers and the technical services required to produce the result.",
          "Smart results are supportive information, not a medical diagnosis or a substitute for a doctor or pharmacist. Inputs are not used for advertising.",
        ],
      },
      {
        id: "sharing",
        title: "When data is shared",
        icon: Eye,
        paragraphs: [
          "We do not sell your data. We may disclose the minimum needed to a pharmacy, organization, or relevant party to fulfill an action you started, such as a medicine or donation request.",
          "We may use hosting, map and place, file-processing, and smart-service providers to operate a requested feature. Each provider receives only the data needed for its service, subject to applicable safeguards.",
          "We may disclose information when required by law or when necessary to protect users and the platform from fraud or harm.",
        ],
      },
      {
        id: "storage",
        title: "Storage and retention",
        icon: Database,
        paragraphs: [
          "The website uses browser storage for the signed-in session, selected language, and essential preferences. We do not use this information to build an advertising profile.",
          "We retain data while the account is active or as needed to provide the service. Some records may be retained longer for legal, financial, or security requirements, then deleted or de-identified when no longer needed.",
        ],
      },
      {
        id: "security",
        title: "How we protect information",
        icon: LockKeyhole,
        paragraphs: [
          "We use role-based access, identity checks for protected actions, controls for sensitive files and data, and encrypted connections when the production service is deployed.",
          "No electronic method is completely secure. We review safeguards and recommend a strong password, keeping sign-in details private, and signing out on shared devices.",
        ],
      },
      {
        id: "rights",
        title: "Your choices and rights",
        icon: SlidersHorizontal,
        bullets: [
          "Review your account information and update editable details.",
          "Decline location, camera, or file access; only the dependent feature may stop working.",
          "Request correction of inaccurate data or deletion of your account and associated data.",
          "Cancel requests or clear search history where the platform provides that option.",
          "Ask about or object to specific processing through the official contact channel.",
        ],
        note: "We may verify identity before completing a data request. Records required by law or needed to protect rights and prevent fraud may be exempt.",
      },
      {
        id: "children",
        title: "Children's privacy",
        icon: UserRound,
        paragraphs: [
          "The platform is not intended for independent use by children. A parent or legal guardian should supervise the entry of a minor's information and use health services on their behalf where required.",
        ],
      },
      {
        id: "updates",
        title: "Policy updates",
        icon: FileCheck2,
        paragraphs: [
          "We may update this policy as services or requirements change. The new version and date will appear here, with a clearer notice when a change is material.",
        ],
      },
      {
        id: "contact",
        title: "Privacy contact",
        icon: Mail,
        paragraphs: [
          "For privacy questions or data requests, use the privacy email below when available, or the official contact channel listed in Dawaai's published service information.",
        ],
      },
    ],
    footer: "Dawaai — closer care, clearer information.",
  },
  tr: {
    language: "Türkçe",
    dir: "ltr",
    locale: "tr-TR",
    title: "Gizlilik Politikası",
    eyebrow: "Gizliliğiniz bakımınızın bir parçasıdır",
    intro:
      "Bu politika, Dawaai web sitesini ve hizmetlerini kullanırken bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.",
    effectiveLabel: "Son güncelleme",
    effectiveDate: "14 Ağustos 2026",
    summaryTitle: "Kısaca",
    summary:
      "Yalnızca hizmeti sunmak için gereken verileri kullanırız. Kişisel veya sağlık bilgilerinizi satmayız ve hedefli reklam için kullanmayız.",
    tocTitle: "Bu sayfada",
    home: "Ana sayfa",
    back: "Ana sayfaya dön",
    login: "Giriş yap",
    sections: [
      {
        id: "scope",
        title: "Biz kimiz ve politikanın kapsamı",
        icon: ShieldCheck,
        paragraphs: [
          "Dawaai; kullanıcıları eczaneler, kuruluşlar ve ilaç tedarik zincirindeki taraflarla buluşturan dijital bir platformdur. İlaç arama, talep, bağış ve sağlık destek hizmetleri sunar.",
          "Bu politika web sitesi, hesaplar ve bağlantılı hizmetler için geçerlidir. Platform üzerinden açılan harici hizmetler kendi gizlilik politikalarına tabidir.",
        ],
      },
      {
        id: "data",
        title: "İşlediğimiz veriler",
        icon: Database,
        groups: [
          {
            title: "Hesap ve kimlik",
            text: "Ad, e-posta, telefon, profil görseli, hesap rolü ve profesyonel hesaplar için gereken doğrulama bilgileri.",
            icon: UserRound,
          },
          {
            title: "Sağlık ve ilaç verileri",
            text: "Kullandığınız özelliklere göre girdiğiniz tıbbi profil, alerjiler, kronik durumlar, ilaçlar, reçeteler, ilaç talepleri ve arama geçmişi.",
            icon: HeartPulse,
          },
          {
            title: "Konum",
            text: "İzninizle yakındaki eczaneleri ve rotayı göstermek için konumunuz veya tesis sahibinin girdiği tesis konumu. Kullanıcı konumunu arka planda izlemeyiz.",
            icon: MapPin,
          },
          {
            title: "Dosyalar ve içerik",
            text: "Profil görseli, reçete, lisans veya doğrulama belgesi gibi yüklediğiniz dosyalar ile oluşturduğunuz notlar, puanlar ve sohbetler.",
            icon: FileCheck2,
          },
          {
            title: "Teknik kullanım verileri",
            text: "Oturum bilgileri, ağ adresi, tarayıcı türü, hata ve istek kayıtları ve platformun temel kullanımını ölçen dolaylı ziyaret kimliği.",
            icon: Activity,
          },
        ],
      },
      {
        id: "purpose",
        title: "Verileri neden kullanıyoruz?",
        icon: SlidersHorizontal,
        bullets: [
          "Hesap oluşturmak, doğrulamak ve role dayalı erişimi yönetmek.",
          "İlaç ve eczane aramak, yakınlığı hesaplamak ve rota göstermek.",
          "İlaç taleplerini, değerlendirmeleri, bağışları ve yardım taleplerini yürütmek.",
          "Sağlık profili, reçete, bildirim ve istenen hizmetleri sunmak.",
          "Eczane lisanslarını, kuruluş belgelerini ve profesyonel hesapları incelemek.",
          "Hesapları korumak, kötüye kullanımı önlemek ve performansı iyileştirmek.",
          "Yasal yükümlülükleri yerine getirmek ve gerekli kayıtları saklamak.",
        ],
      },
      {
        id: "ai",
        title: "Akıllı hizmetler",
        icon: Bot,
        paragraphs: [
          "Akıllı arama, reçete analizi, sohbet veya belge destekli doğrulama kullandığınızda seçtiğiniz girdiler, sonucu üretmek için Dawaai sunucularına ve gerekli teknik hizmetlere gönderilir.",
          "Akıllı sonuçlar destekleyici bilgidir; tıbbi tanı veya doktor ya da eczacı yerine geçmez. Bu girdiler reklam amacıyla kullanılmaz.",
        ],
      },
      {
        id: "sharing",
        title: "Veriler ne zaman paylaşılır?",
        icon: Eye,
        paragraphs: [
          "Verilerinizi satmayız. Başlattığınız bir ilaç veya bağış talebini tamamlamak için gereken en az bilgi ilgili eczane, kuruluş veya tarafla paylaşılabilir.",
          "İstenen özelliği çalıştırmak için barındırma, harita ve yer, dosya işleme ve akıllı hizmet sağlayıcılarından yararlanabiliriz. Her sağlayıcı yalnızca hizmeti için gerekli veriyi alır.",
          "Yasaların gerektirdiği veya kullanıcıları ve platformu dolandırıcılık ya da zarardan korumak için gerekli durumlarda bilgi açıklayabiliriz.",
        ],
      },
      {
        id: "storage",
        title: "Saklama ve süre",
        icon: Database,
        paragraphs: [
          "Web sitesi; giriş oturumu, seçilen dil ve temel tercihleri saklamak için tarayıcı depolamasını kullanır. Bu bilgiler reklam profili oluşturmak için kullanılmaz.",
          "Verileri hesap aktif olduğu veya hizmet için gerektiği sürece saklarız. Bazı kayıtlar yasal, mali veya güvenlik nedenleriyle daha uzun tutulabilir; ihtiyaç kalmadığında silinir veya kimlikten ayrılır.",
        ],
      },
      {
        id: "security",
        title: "Bilgileri nasıl koruyoruz?",
        icon: LockKeyhole,
        paragraphs: [
          "Role dayalı erişim, korunan işlemler için kimlik denetimi, hassas dosya ve veri kontrolleri ve üretim ortamında şifreli bağlantılar kullanırız.",
          "Hiçbir elektronik yöntem mutlak güvenlik sağlamaz. Güçlü parola kullanmanızı, giriş bilgilerinizi paylaşmamanızı ve ortak cihazlarda oturumu kapatmanızı öneririz.",
        ],
      },
      {
        id: "rights",
        title: "Seçimleriniz ve haklarınız",
        icon: SlidersHorizontal,
        bullets: [
          "Hesap bilgilerinizi incelemek ve düzenlenebilir alanları güncellemek.",
          "Konum, kamera veya dosya iznini reddetmek; yalnızca ilgili özellik çalışmayabilir.",
          "Hatalı verilerin düzeltilmesini veya hesabınızın ve ilişkili verilerin silinmesini istemek.",
          "Platformun izin verdiği yerde talepleri iptal etmek veya arama geçmişini temizlemek.",
          "Resmî iletişim kanalı üzerinden belirli bir işleme itiraz etmek veya bilgi istemek.",
        ],
        note: "Veri talebini yerine getirmeden önce kimliğinizi doğrulayabiliriz. Yasaların saklanmasını zorunlu kıldığı veya hakları korumak ve dolandırıcılığı önlemek için gereken kayıtlar istisna olabilir.",
      },
      {
        id: "children",
        title: "Çocukların gizliliği",
        icon: UserRound,
        paragraphs: [
          "Platform çocukların bağımsız kullanımına yönelik değildir. Gerektiğinde bir ebeveyn veya yasal vasi, reşit olmayan kişinin bilgilerini ve sağlık hizmetlerini gözetmelidir.",
        ],
      },
      {
        id: "updates",
        title: "Politika güncellemeleri",
        icon: FileCheck2,
        paragraphs: [
          "Hizmetler veya gereksinimler değiştiğinde bu politikayı güncelleyebiliriz. Yeni sürüm ve tarih bu sayfada yayımlanır; önemli değişikliklerde daha belirgin bir bildirim sunulur.",
        ],
      },
      {
        id: "contact",
        title: "Gizlilik iletişimi",
        icon: Mail,
        paragraphs: [
          "Gizlilik soruları veya veri talepleri için, mevcutsa aşağıdaki gizlilik e-postasını ya da Dawaai'nin yayımlanmış hizmet bilgilerindeki resmî iletişim kanalını kullanın.",
        ],
      },
    ],
    footer: "Dawaai — daha yakın bakım, daha açık bilgi.",
  },
};

export function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const language = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );
  const content = policyContent[language] ?? policyContent.en;
  const isRtl = content.dir === "rtl";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const privacyEmail = String(
    import.meta.env.VITE_PRIVACY_CONTACT_EMAIL || "",
  ).trim();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${content.title} | دوائي`;
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      document.title = previousTitle;
    };
  }, [content.title]);

  return (
    <div
      dir={content.dir}
      lang={language}
      className="min-h-screen bg-[#f4f8f8] text-[#17343b]"
    >
      <header className="sticky top-0 z-50 border-b border-[#174b57]/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
          <Brand responsive />
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#174b57]/12 bg-white px-3 text-sm font-bold text-[#174b57] transition hover:-translate-y-0.5 hover:border-[#174b57]/25 hover:bg-[#edf6f5]"
            >
              <BackIcon size={17} aria-hidden="true" />
              <span className="hidden sm:inline">{content.back}</span>
              <span className="sm:hidden">{content.home}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#103c46_0%,#174f5b_55%,#216474_100%)] text-white">
          <div
            aria-hidden="true"
            className="absolute -start-24 -top-28 size-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-36 end-[-3rem] size-80 rounded-full bg-[#f5cb72]/10 blur-2xl"
          />
          <div className="relative mx-auto grid max-w-[1180px] gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-[#d9eeee]">
                <ShieldCheck size={18} className="text-[#f5cb72]" />
                {content.eyebrow}
              </div>
              <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-[58px]">
                {content.title}
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#d6e7e9] sm:text-[17px]">
                {content.intro}
              </p>
            </div>
            <div className="w-fit rounded-2xl border border-white/12 bg-white/8 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-bold text-[#a9cbd0]">
                {content.effectiveLabel}
              </p>
              <p className="mt-1 font-extrabold text-white">
                {content.effectiveDate}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">
          <section className="mb-8 flex items-start gap-4 rounded-[24px] border border-[#e6c76e]/35 bg-[#fff9e9] p-5 sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f5cb72] text-[#173f49] shadow-[0_8px_20px_rgba(183,139,41,.18)]">
              <ShieldCheck size={23} />
            </span>
            <div>
              <h2 className="text-lg font-black text-[#173f49]">
                {content.summaryTitle}
              </h2>
              <p className="mt-1 text-[14px] leading-7 text-[#526a70] sm:text-[15px]">
                {content.summary}
              </p>
            </div>
          </section>

          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <aside className="rounded-[24px] border border-[#dce8e8] bg-white p-4 shadow-[0_16px_45px_rgba(20,62,70,.05)] lg:sticky lg:top-[100px]">
              <h2 className="px-3 pb-3 text-sm font-black text-[#173f49]">
                {content.tocTitle}
              </h2>
              <nav aria-label={content.tocTitle} className="grid gap-1">
                {content.sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#63797e] transition hover:bg-[#edf6f5] hover:text-[#174b57]"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#e7f2f1] text-[11px] font-black text-[#216474]">
                      {new Intl.NumberFormat(content.locale).format(index + 1)}
                    </span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>
            </aside>

            <div className="grid gap-5">
              {content.sections.map((section, index) => (
                <PolicySection
                  key={section.id}
                  section={section}
                  number={new Intl.NumberFormat(content.locale).format(
                    index + 1,
                  )}
                  privacyEmail={privacyEmail}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#dce8e8] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
          <Brand />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-[#60777c]">
            <span>{content.footer}</span>
            <Link
              to="/login"
              className="text-[#216474] transition hover:text-[#103c46]"
            >
              {content.login}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PolicySection({ section, number, privacyEmail }) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className="scroll-mt-[100px] rounded-[26px] border border-[#dce8e8] bg-white p-5 shadow-[0_16px_45px_rgba(20,62,70,.045)] sm:p-7"
    >
      <div className="flex items-center gap-4">
        <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e7f2f1] text-[#216474]">
          <Icon size={23} strokeWidth={1.9} />
          <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#f5cb72] text-[10px] font-black text-[#173f49] ring-2 ring-white">
            {number}
          </span>
        </span>
        <h2 className="text-xl font-black tracking-[-0.025em] text-[#173f49] sm:text-2xl">
          {section.title}
        </h2>
      </div>

      {section.paragraphs ? (
        <div className="mt-5 grid gap-3 text-[14px] leading-8 text-[#596f74] sm:text-[15px]">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {section.groups ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {section.groups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <article
                key={group.title}
                className="rounded-2xl border border-[#e2ecec] bg-[#f8fbfa] p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
                    <GroupIcon size={18} />
                  </span>
                  <h3 className="font-black text-[#24474f]">{group.title}</h3>
                </div>
                <p className="mt-3 text-[13px] leading-7 text-[#61777c]">
                  {group.text}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}

      {section.bullets ? (
        <ul className="mt-5 grid gap-3 text-[14px] leading-7 text-[#596f74] sm:text-[15px]">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#e7aa38]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.note ? (
        <p className="mt-5 rounded-2xl border border-[#dce8e8] bg-[#f5f9f8] px-4 py-3 text-[13px] leading-7 text-[#60777c]">
          {section.note}
        </p>
      ) : null}

      {section.id === "contact" && privacyEmail ? (
        <a
          dir="ltr"
          href={`mailto:${privacyEmail}`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#174b57] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#103c46]"
        >
          <Mail size={17} />
          {privacyEmail}
        </a>
      ) : null}
    </section>
  );
}
