import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

// Update this date whenever the terms change.
const LAST_UPDATED = '2026-07-22';

// Contact address placeholder — replace with the real address before launch.
const CONTACT = '[e-mail de contato]';

const content = {
    fr: {
        back: 'Retour',
        title: 'Conditions d’utilisation',
        metaDescription: 'Conditions d’utilisation du site THE TALK.',
        lastUpdatedLabel: 'Dernière mise à jour :',
        draftNotice: 'MODÈLE — Ce document est un modèle et doit être revu par un professionnel du droit avant toute mise en production.',
        intro: `Les présentes conditions régissent l’utilisation du site THE TALK. En accédant au site, vous acceptez ces conditions.`,
        sections: [
            {
                h: 'Acceptation des conditions',
                p: ['En consultant ce site, vous reconnaissez avoir lu et accepté ces conditions. Si vous n’êtes pas d’accord, veuillez ne pas utiliser le site.'],
            },
            {
                h: 'Utilisation du contenu',
                p: ['Le contenu (articles, vidéos, images) est mis à disposition pour un usage personnel et non commercial. Toute reproduction ou rediffusion sans autorisation est interdite.'],
            },
            {
                h: 'Propriété intellectuelle',
                p: ['Sauf mention contraire, le contenu éditorial appartient à THE TALK et à ses auteurs. Les vidéos sont hébergées sur YouTube et restent soumises aux conditions de YouTube.'],
            },
            {
                h: 'Contenu de tiers',
                p: ['Le site intègre des services tiers (YouTube, Spotify, entre autres). Nous ne sommes pas responsables du contenu, des pratiques ou des conditions de ces services.'],
            },
            {
                h: 'Exclusion de garanties',
                p: ['Le site est fourni « en l’état », sans garantie d’aucune sorte. Nous ne garantissons pas que le site sera exempt d’erreurs ou disponible sans interruption.'],
            },
            {
                h: 'Limitation de responsabilité',
                p: ['Dans les limites permises par la loi, THE TALK ne saurait être tenu responsable des dommages résultant de l’utilisation ou de l’impossibilité d’utiliser le site.'],
            },
            {
                h: 'Modification des conditions',
                p: ['Nous pouvons modifier ces conditions à tout moment. La date de dernière mise à jour indique la version en vigueur.'],
            },
            {
                h: 'Contact',
                p: [`Pour toute question relative à ces conditions : ${CONTACT}.`],
            },
        ],
    },
    en: {
        back: 'Back',
        title: 'Terms of Use',
        metaDescription: 'Terms of use for the THE TALK website.',
        lastUpdatedLabel: 'Last updated:',
        draftNotice: 'TEMPLATE — This document is a template and must be reviewed by a legal professional before going live.',
        intro: `These terms govern the use of the THE TALK website. By accessing the site, you agree to these terms.`,
        sections: [
            {
                h: 'Acceptance of terms',
                p: ['By using this site, you acknowledge that you have read and accepted these terms. If you do not agree, please do not use the site.'],
            },
            {
                h: 'Use of content',
                p: ['The content (articles, videos, images) is provided for personal, non-commercial use. Any reproduction or redistribution without permission is prohibited.'],
            },
            {
                h: 'Intellectual property',
                p: ['Unless otherwise stated, the editorial content belongs to THE TALK and its authors. Videos are hosted on YouTube and remain subject to YouTube’s terms.'],
            },
            {
                h: 'Third-party content',
                p: ['The site embeds third-party services (YouTube, Spotify, among others). We are not responsible for the content, practices or terms of those services.'],
            },
            {
                h: 'Disclaimer of warranties',
                p: ['The site is provided “as is”, without warranty of any kind. We do not guarantee that the site will be error-free or available without interruption.'],
            },
            {
                h: 'Limitation of liability',
                p: ['To the extent permitted by law, THE TALK shall not be liable for any damages arising from the use of, or inability to use, the site.'],
            },
            {
                h: 'Changes to these terms',
                p: ['We may change these terms at any time. The last-updated date indicates the version in force.'],
            },
            {
                h: 'Contact',
                p: [`For any question about these terms: ${CONTACT}.`],
            },
        ],
    },
    pt: {
        back: 'Voltar',
        title: 'Termos de Uso',
        metaDescription: 'Termos de uso do site THE TALK.',
        lastUpdatedLabel: 'Última atualização:',
        draftNotice: 'MODELO — Este documento é um modelo e deve ser revisado por um profissional do direito antes de entrar em produção.',
        intro: `Estes termos regem o uso do site THE TALK. Ao acessar o site, você concorda com estes termos.`,
        sections: [
            {
                h: 'Aceitação dos termos',
                p: ['Ao usar este site, você reconhece que leu e aceitou estes termos. Se não concordar, por favor não utilize o site.'],
            },
            {
                h: 'Uso do conteúdo',
                p: ['O conteúdo (artigos, vídeos, imagens) é disponibilizado para uso pessoal e não comercial. Qualquer reprodução ou redistribuição sem autorização é proibida.'],
            },
            {
                h: 'Propriedade intelectual',
                p: ['Salvo indicação em contrário, o conteúdo editorial pertence ao THE TALK e a seus autores. Os vídeos são hospedados no YouTube e permanecem sujeitos aos termos do YouTube.'],
            },
            {
                h: 'Conteúdo de terceiros',
                p: ['O site incorpora serviços de terceiros (YouTube, Spotify, entre outros). Não somos responsáveis pelo conteúdo, práticas ou termos desses serviços.'],
            },
            {
                h: 'Isenção de garantias',
                p: ['O site é fornecido “no estado em que se encontra”, sem garantia de qualquer tipo. Não garantimos que o site estará livre de erros ou disponível sem interrupções.'],
            },
            {
                h: 'Limitação de responsabilidade',
                p: ['Na medida permitida por lei, o THE TALK não se responsabiliza por danos decorrentes do uso ou da impossibilidade de uso do site.'],
            },
            {
                h: 'Alterações destes termos',
                p: ['Podemos alterar estes termos a qualquer momento. A data de última atualização indica a versão vigente.'],
            },
            {
                h: 'Contato',
                p: [`Para qualquer dúvida sobre estes termos: ${CONTACT}.`],
            },
        ],
    },
};

export default function TermsPage() {
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

                    <div className="flex items-start gap-3 border-2 border-black dark:border-white rounded-none p-4 mb-10" role="note">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="font-minimal text-sm font-bold leading-relaxed">{c.draftNotice}</p>
                    </div>

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
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
