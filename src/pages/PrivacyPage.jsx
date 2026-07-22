import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

// Update this date whenever the policy changes.
const LAST_UPDATED = '2026-07-22';

// Contact address placeholder — replace with the real address before launch.
const CONTACT = '[e-mail de contato]';

const content = {
    fr: {
        back: 'Retour',
        title: 'Politique de confidentialité',
        metaDescription: 'Comment THE TALK collecte, utilise et protège vos données.',
        lastUpdatedLabel: 'Dernière mise à jour :',
        intro: `THE TALK est une plateforme de médias éditoriaux. Nous limitons la collecte de données au strict nécessaire pour faire fonctionner le site et envoyer notre newsletter. Cette page décrit nos pratiques réelles.`,
        sections: [
            {
                h: 'Données que nous collectons',
                p: ['Nous ne proposons pas de comptes utilisateur : vous pouvez consulter tout le contenu sans vous inscrire. Les seules données personnelles que nous collectons sont :'],
                list: [
                    'Votre adresse e-mail, uniquement si vous vous inscrivez volontairement à la newsletter.',
                    'Des données techniques anonymisées (type d’appareil, pages consultées, erreurs) via nos outils d’hébergement et de suivi.',
                ],
            },
            {
                h: 'Comment nous utilisons ces données',
                p: ['Nous utilisons ces données pour :'],
                list: [
                    'Vous envoyer la newsletter à laquelle vous vous êtes inscrit(e).',
                    'Détecter et corriger les erreurs techniques du site.',
                    'Comprendre l’usage global du site afin de l’améliorer.',
                ],
            },
            {
                h: 'Services tiers',
                p: ['Nous nous appuyons sur des prestataires qui traitent certaines données en notre nom :'],
                list: [
                    'Mailchimp — gestion et envoi de la newsletter.',
                    'Vercel — hébergement du site et mesures de performance.',
                    'Sanity — système de gestion de contenu (CMS).',
                    'Sentry — surveillance et diagnostic des erreurs.',
                    'Nous ne traitons aucun paiement : aucune donnée bancaire n’est collectée.',
                ],
            },
            {
                h: 'Cookies et stockage local',
                p: ['Nous n’utilisons pas de cookies publicitaires ni de traceurs commerciaux. Le site conserve uniquement, dans votre navigateur, vos préférences de thème (clair/sombre) et de langue.'],
            },
            {
                h: 'Vos droits',
                p: ['Vous pouvez à tout moment demander l’accès à vos données, leur rectification ou leur suppression, et vous désinscrire de la newsletter (lien présent dans chaque e-mail). Pour exercer ces droits, contactez-nous.'],
            },
            {
                h: 'Conservation des données',
                p: ['Votre adresse e-mail est conservée jusqu’à votre désinscription. Les données techniques sont conservées de façon temporaire à des fins de diagnostic.'],
            },
            {
                h: 'Contact',
                p: [`Pour toute question relative à cette politique ou à vos données : ${CONTACT}.`],
            },
        ],
    },
    en: {
        back: 'Back',
        title: 'Privacy Policy',
        metaDescription: 'How THE TALK collects, uses and protects your data.',
        lastUpdatedLabel: 'Last updated:',
        intro: `THE TALK is an editorial media platform. We keep data collection to the minimum needed to run the site and send our newsletter. This page describes our actual practices.`,
        sections: [
            {
                h: 'Data we collect',
                p: ['We do not offer user accounts: you can read all content without signing up. The only personal data we collect is:'],
                list: [
                    'Your email address, only if you voluntarily subscribe to the newsletter.',
                    'Anonymized technical data (device type, pages viewed, errors) through our hosting and monitoring tools.',
                ],
            },
            {
                h: 'How we use this data',
                p: ['We use this data to:'],
                list: [
                    'Send you the newsletter you subscribed to.',
                    'Detect and fix technical errors on the site.',
                    'Understand overall site usage in order to improve it.',
                ],
            },
            {
                h: 'Third-party services',
                p: ['We rely on providers that process some data on our behalf:'],
                list: [
                    'Mailchimp — newsletter management and delivery.',
                    'Vercel — site hosting and performance measurement.',
                    'Sanity — content management system (CMS).',
                    'Sentry — error monitoring and diagnostics.',
                    'We process no payments: no financial data is collected.',
                ],
            },
            {
                h: 'Cookies and local storage',
                p: ['We use no advertising cookies or commercial trackers. The site only stores your theme (light/dark) and language preferences in your browser.'],
            },
            {
                h: 'Your rights',
                p: ['You may at any time request access to your data, its correction or deletion, and unsubscribe from the newsletter (link in every email). To exercise these rights, contact us.'],
            },
            {
                h: 'Data retention',
                p: ['Your email address is kept until you unsubscribe. Technical data is kept temporarily for diagnostic purposes.'],
            },
            {
                h: 'Contact',
                p: [`For any question about this policy or your data: ${CONTACT}.`],
            },
        ],
    },
    pt: {
        back: 'Voltar',
        title: 'Política de Privacidade',
        metaDescription: 'Como o THE TALK coleta, usa e protege seus dados.',
        lastUpdatedLabel: 'Última atualização:',
        intro: `O THE TALK é uma plataforma de mídia editorial. Limitamos a coleta de dados ao mínimo necessário para operar o site e enviar nossa newsletter. Esta página descreve nossas práticas reais.`,
        sections: [
            {
                h: 'Dados que coletamos',
                p: ['Não oferecemos contas de usuário: você pode acessar todo o conteúdo sem se cadastrar. Os únicos dados pessoais que coletamos são:'],
                list: [
                    'Seu endereço de e-mail, apenas se você se inscrever voluntariamente na newsletter.',
                    'Dados técnicos anonimizados (tipo de dispositivo, páginas acessadas, erros) por meio das ferramentas de hospedagem e monitoramento.',
                ],
            },
            {
                h: 'Como usamos esses dados',
                p: ['Usamos esses dados para:'],
                list: [
                    'Enviar a newsletter para a qual você se inscreveu.',
                    'Detectar e corrigir erros técnicos do site.',
                    'Entender o uso geral do site para melhorá-lo.',
                ],
            },
            {
                h: 'Serviços de terceiros',
                p: ['Contamos com prestadores que tratam alguns dados em nosso nome:'],
                list: [
                    'Mailchimp — gestão e envio da newsletter.',
                    'Vercel — hospedagem do site e medição de desempenho.',
                    'Sanity — sistema de gestão de conteúdo (CMS).',
                    'Sentry — monitoramento e diagnóstico de erros.',
                    'Não processamos pagamentos: nenhum dado financeiro é coletado.',
                ],
            },
            {
                h: 'Cookies e armazenamento local',
                p: ['Não usamos cookies de publicidade nem rastreadores comerciais. O site armazena apenas suas preferências de tema (claro/escuro) e idioma no seu navegador.'],
            },
            {
                h: 'Seus direitos',
                p: ['Você pode, a qualquer momento, solicitar acesso aos seus dados, sua correção ou exclusão, e cancelar a inscrição na newsletter (link em cada e-mail). Para exercer esses direitos, entre em contato.'],
            },
            {
                h: 'Retenção de dados',
                p: ['Seu e-mail é mantido até o cancelamento da inscrição. Os dados técnicos são mantidos temporariamente para fins de diagnóstico.'],
            },
            {
                h: 'Contato',
                p: [`Para qualquer dúvida sobre esta política ou sobre seus dados: ${CONTACT}.`],
            },
        ],
    },
};

export default function PrivacyPage() {
    const { i18n } = useTranslation();
    const lang = ['fr', 'en', 'pt'].includes((i18n.language || '').slice(0, 2)) ? i18n.language.slice(0, 2) : 'fr';
    const c = content[lang];
    const formattedDate = new Date(LAST_UPDATED).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang, {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white selection:bg-black selection:text-white transition-colors duration-300">
            <Helmet>
                <title>{c.title} | THE TALK</title>
                <meta name="description" content={c.metaDescription} />
            </Helmet>
            <Navbar />
            <main id="main-content" className="pt-24 md:pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-3xl">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[#6C757D] hover:text-black dark:hover:text-white transition-colors mb-8">
                        <ArrowLeft size={16} /> {c.back}
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-creativo font-bold mb-3 tracking-tight">{c.title}</h1>
                    <p className="text-sm text-gray-500 dark:text-[#6C757D] font-minimal mb-12">{c.lastUpdatedLabel} {formattedDate}</p>
                    <p className="text-lg font-minimal leading-relaxed text-gray-700 dark:text-gray-300 mb-12">{c.intro}</p>
                    <div className="space-y-10">
                        {c.sections.map((s, i) => (
                            <section key={i}>
                                <h2 className="text-2xl font-creativo font-bold mb-4">{s.h}</h2>
                                {s.p.map((para, j) => (
                                    <p key={j} className="font-minimal leading-relaxed text-gray-700 dark:text-gray-300 mb-3">{para}</p>
                                ))}
                                {s.list && (
                                    <ul className="list-disc pl-6 space-y-2 font-minimal text-gray-700 dark:text-gray-300">
                                        {s.list.map((li, k) => <li key={k}>{li}</li>)}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
