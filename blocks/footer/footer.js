import './uifrontend/_footer.js';

function parseFooterData(block) {
  // Default data structure
  const data = {
    newsletterLabel: 'Get the latest deals and more',
    newsletterPlaceholder: 'Enter email address', 
    newsletterButtonText: 'Sign up',
    socialLabel: 'Follow us at:',
    socialLinks: [
      { platform: 'facebook', url: '#', icon: '/icons/social/icon-facebook.svg', altText: 'Facebook' },
      { platform: 'x', url: '#', icon: '/icons/social/icon-x.svg', altText: 'Twitter' },
      { platform: 'discord', url: '#', icon: '/icons/social/icon-discord.svg', altText: 'Discord' },
      { platform: 'youtube', url: '#', icon: '/icons/social/icon-youtube.svg', altText: 'YouTube' },
      { platform: 'twitch', url: '#', icon: '/icons/social/icon-twitch.svg', altText: 'Twitch' },
      { platform: 'instagram', url: '#', icon: '/icons/social/icon-instagram.svg', altText: 'Instagram' },
      { platform: 'tiktok', url: '#', icon: '/icons/social/icon-tiktok.svg', altText: 'TikTok' },
      { platform: 'thread', url: '#', icon: '/icons/social/icon-thread.svg', altText: 'Threads' }
    ],
    footerColumns: [
      {
        columnTitle: 'Shop',
        links: [{ linkText: 'All Desktops', linkUrl: '#' }]
      },
      {
        columnTitle: 'Support', 
        links: [
          { linkText: 'Help Me Choose', linkUrl: '#' },
          { linkText: 'Contact Us', linkUrl: '#' },
          { linkText: 'Shopping FAQs', linkUrl: '#' }
        ]
      },
      {
        columnTitle: 'Support',
        links: [
          { linkText: 'Help Me Choose', linkUrl: '#' },
          { linkText: 'Education & Commercial Inquiries', linkUrl: '#' }
        ]
      }
    ],
    globalText: 'Global / English',
    globalIcon: '/icons/Global.svg',
    legalLinks: [
      { linkText: 'Privacy Policy', linkUrl: '#' },
      { linkText: 'Terms & Conditions', linkUrl: '#' },
      { linkText: 'Cookie Settings', linkUrl: '#' }
    ]
  };

  // Process block content for authoring data
  const rows = [...block.children];
  let footerColumnsArray = [];
  let legalLinksArray = [];
  let socialLinksArray = [];
  let currentColumn = null;
  let currentSection = '';
  
  rows.forEach((row, index) => {
    const cells = [...row.children];
    
    if (cells.length >= 2) {
      const field = cells[0].textContent.trim();
      const value = cells[1].textContent.trim();
      
      // Handle simple text fields
      switch (field) {
        case 'Newsletter Label':
          data.newsletterLabel = value;
          break;
        case 'Newsletter Placeholder':
          data.newsletterPlaceholder = value;
          break;
        case 'Newsletter Button Text':
          data.newsletterButtonText = value;
          break;
        case 'Social Label':
          data.socialLabel = value;
          break;
        case 'Global Text':
          data.globalText = value;
          break;
        case 'Global Icon':
          data.globalIcon = value;
          break;
        default:
          // Handle complex structured data
          if (field.startsWith('Column ')) {
            // Parse footer columns - format: "Column Title" | "Links (pipe separated)"
            const columnTitle = field.replace('Column ', '');
            const links = value.split('|').map(link => {
              const [linkText, linkUrl] = link.split(' - ');
              return { 
                linkText: linkText ? linkText.trim() : link.trim(), 
                linkUrl: linkUrl ? linkUrl.trim() : '#' 
              };
            });
            footerColumnsArray.push({ columnTitle, links });
          } else if (field.startsWith('Legal ')) {
            // Parse legal links - format: "Legal Link Name" | "URL"
            const linkText = field.replace('Legal ', '');
            legalLinksArray.push({ linkText, linkUrl: value });
          } else if (field.startsWith('Social ')) {
            // Parse social links - format: "Social Platform" | "URL|Icon|AltText"
            const platform = field.replace('Social ', '').toLowerCase();
            const parts = value.split('|');
            const socialLink = { 
              platform, 
              url: parts[0] || '#',
              icon: parts[1] || `/icons/social/icon-${platform}.svg`,
              altText: parts[2] || platform.charAt(0).toUpperCase() + platform.slice(1)
            };
            socialLinksArray.push(socialLink);
          }
          break;
      }
    } else if (cells.length === 1) {
      const singleValue = cells[0].textContent.trim();
      
      // Handle single-cell rows that might contain structured data
      if (singleValue.includes('|')) {
        // Parse pipe-separated data
        const parts = singleValue.split('|').map(p => p.trim());
        if (parts.length === 2) {
          const [key, value] = parts;
          
          if (key.startsWith('Column:')) {
            const columnTitle = key.replace('Column:', '').trim();
            const links = value.split(',').map(link => {
              const [linkText, linkUrl] = link.split(' - ');
              return { 
                linkText: linkText ? linkText.trim() : link.trim(), 
                linkUrl: linkUrl ? linkUrl.trim() : '#' 
              };
            });
            footerColumnsArray.push({ columnTitle, links });
          } else if (key.startsWith('Legal:')) {
            const linkText = key.replace('Legal:', '').trim();
            legalLinksArray.push({ linkText, linkUrl: value });
          }
        }
      }
    }
  });

  // Update arrays if they have content
  if (footerColumnsArray.length > 0) {
    data.footerColumns = footerColumnsArray;
  }
  if (legalLinksArray.length > 0) {
    data.legalLinks = legalLinksArray;
  }
  if (socialLinksArray.length > 0) {
    data.socialLinks = socialLinksArray;
  }

  return data;
}

function buildSocialIcons(socialLinks, socialLabel) {
  const socialIconsHTML = socialLinks.map(link => {
    const altText = link.altText || link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
    
    // Define SVG icons for each platform
    const svgIcons = {
      facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
        <path d="M25.1706 12.8558C25.1706 12.8558 23.4537 12.8558 22.7698 12.8558C21.9259 12.8558 21.7513 13.205 21.7513 14.078C21.7513 14.8056 21.7513 16.1878 21.7513 16.1878H25.1706L24.836 19.8981H21.7368V31H17.3135V19.9418H15V16.2024H17.3135C17.3135 16.2024 17.3135 15.664 17.3135 13.2341C17.3135 10.455 18.8122 9 22.1005 9C22.6389 9 25.1706 9 25.1706 9V12.8558Z" fill="#DCDCDC" />
      </svg>`,
      instagram: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
        <path d="M24.3858 8.7998H15.414C11.7626 8.7998 8.7998 11.7626 8.7998 15.414V24.3858C8.7998 28.0372 11.7626 31 15.414 31H24.3858C28.0372 31 31 28.0372 31 24.3858V15.414C31 11.7626 28.0372 8.7998 24.3858 8.7998ZM28.7675 24.4067C28.7675 26.827 26.8062 28.7883 24.3858 28.7883H15.414C12.9936 28.7883 11.0323 26.827 11.0323 24.4067V15.4348C11.0323 13.0145 12.9936 11.0532 15.414 11.0532H24.3858C26.8062 11.0532 28.7675 13.0145 28.7675 15.4348V24.4067Z" fill="#DCDCDC" />
        <path d="M19.8785 14.1621C16.707 14.1621 14.1406 16.7494 14.1406 19.8999C14.1406 23.0505 16.7279 25.6378 19.8785 25.6378C23.029 25.6378 25.6163 23.0505 25.6163 19.8999C25.6163 16.7494 23.0499 14.1621 19.8785 14.1621ZM19.8785 23.4261C17.938 23.4261 16.3732 21.8612 16.3732 19.9208C16.3732 17.9804 17.938 16.4155 19.8785 16.4155C21.8189 16.4155 23.3838 17.9804 23.3838 19.9208C23.4046 21.8404 21.8189 23.4261 19.8785 23.4261Z" fill="#DCDCDC" />
        <path d="M25.6378 15.5813C26.3984 15.5813 27.0149 14.9648 27.0149 14.2042C27.0149 13.4437 26.3984 12.8271 25.6378 12.8271C24.8773 12.8271 24.2607 13.4437 24.2607 14.2042C24.2607 14.9648 24.8773 15.5813 25.6378 15.5813Z" fill="#DCDCDC" />
      </svg>`,
      tiktok: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_17388_90604)">
          <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
          <path d="M29.9471 14.3531C29.9471 14.2514 29.9471 14.2514 29.8337 14.2514C29.5767 14.2514 29.3197 14.2224 29.0628 14.1861C28.1331 14.0481 25.1172 12.5304 24.6108 10.0469C24.6033 9.99603 24.4899 9.37878 24.4899 9.11735C24.4899 9.00116 24.4899 9.00116 24.369 9.00116C24.3387 9.00116 24.316 9.00116 24.2858 9.00116C23.1067 9.00116 21.9276 9.00116 20.7485 9.00116C20.5142 9.00116 20.5444 8.97211 20.5444 9.20449C20.5444 14.1207 20.5444 19.037 20.5444 23.9532C20.5444 24.1348 20.5368 24.3163 20.5066 24.4978C20.3252 25.4491 19.8188 26.1898 18.9647 26.7054C18.2239 27.1484 17.4152 27.2719 16.5535 27.1121C16.2814 27.0613 16.032 26.9596 15.775 26.8652C15.7523 26.8507 15.7372 26.8289 15.7145 26.8144C15.6314 26.749 15.5331 26.6909 15.4424 26.6256C14.3465 25.8994 13.8325 24.89 13.9912 23.6264C14.1499 22.3484 14.9209 21.4769 16.1832 21.0267C16.5611 20.896 16.9541 20.8379 17.3623 20.8597C17.6193 20.8742 17.8763 20.9033 18.1332 20.9759C18.2239 20.9977 18.2693 20.9686 18.2693 20.8815C18.2693 20.8524 18.2693 20.8161 18.2693 20.7871C18.2693 19.9011 18.2315 17.9767 18.2315 17.9695C18.2315 17.7153 18.2315 17.4612 18.2391 17.207C18.2391 17.1344 18.2013 17.1199 18.1408 17.1126C17.6646 17.0618 17.1884 17.0472 16.7123 17.0835C16.0547 17.1271 15.4122 17.2578 14.7849 17.4757C13.7947 17.817 12.9179 18.3471 12.1621 19.0588C11.512 19.6687 11.0056 20.3731 10.6353 21.1647C10.28 21.9272 10.0759 22.7187 10.0155 23.5538C9.9928 23.9169 9.9928 24.2727 10.0306 24.6358C10.0759 25.1369 10.1742 25.6234 10.3329 26.1027C10.7864 27.4752 11.6103 28.5935 12.7819 29.4867C12.9028 29.5738 13.0162 29.6755 13.1598 29.7336C13.2203 29.7844 13.2807 29.8353 13.3412 29.8861C13.5302 30.0241 13.7342 30.1403 13.9459 30.2419C15.2535 30.8664 16.6367 31.1206 18.0955 30.9463C19.9851 30.7212 21.5572 29.9224 22.7968 28.5354C23.9608 27.2283 24.5277 25.7033 24.5428 23.9895C24.5579 21.5423 24.5428 19.0951 24.5504 16.6478C24.5504 16.5897 24.5126 16.5099 24.5806 16.4736C24.6335 16.4518 24.6864 16.5171 24.7318 16.5462C25.6766 17.1416 26.7045 17.5773 27.8081 17.8243C28.4505 17.9695 29.1005 18.0494 29.7657 18.0494C29.9773 18.0494 30 18.0421 30 17.8388C29.9924 16.9601 29.9471 14.5855 29.9471 14.3531Z" fill="#DCDCDC" />
        </g>
        <defs>
          <clipPath id="clip0_17388_90604">
            <rect width="40" height="40" fill="white" />
          </clipPath>
        </defs>
      </svg>`,
      x: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
        <g clip-path="url(#clip0_17388_90589)">
          <path d="M22.093 18.2702L30.283 8.75H28.3422L21.2308 17.0163L15.551 8.75H9L17.589 21.2501L9 31.2335H10.9409L18.4507 22.504L24.449 31.2335H31L22.0925 18.2702H22.093ZM19.4347 21.3602L18.5644 20.1155L11.6402 10.2111H14.6213L20.2092 18.2042L21.0795 19.4489L28.3431 29.8388H25.3621L19.4347 21.3607V21.3602Z" fill="#DCDCDC" />
        </g>
        <defs>
          <clipPath id="clip0_17388_90589">
            <rect width="22" height="22.495" fill="white" transform="translate(9 8.75)" />
          </clipPath>
        </defs>
      </svg>`,
      youtube: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
        <g clip-path="url(#clip0_17388_90595)">
          <path d="M30.54 14.67C30.4156 14.202 30.1705 13.7748 29.8292 13.4313C29.4878 13.0877 29.0622 12.8399 28.595 12.7125C26.875 12.25 20 12.25 20 12.25C20 12.25 13.125 12.25 11.405 12.7125C10.9378 12.8399 10.5122 13.0877 10.1708 13.4313C9.82951 13.7748 9.58438 14.202 9.46 14.67C9 16.3975 9 20 9 20C9 20 9 23.6025 9.46 25.33C9.58438 25.798 9.82951 26.2252 10.1708 26.5687C10.5122 26.9123 10.9378 27.1601 11.405 27.2875C13.125 27.75 20 27.75 20 27.75C20 27.75 26.875 27.75 28.595 27.2875C29.0622 27.1601 29.4878 26.9123 29.8292 26.5687C30.1705 26.2252 30.4156 25.798 30.54 25.33C31 23.6025 31 20 31 20C31 20 31 16.3975 30.54 14.67ZM17.75 23.2712V16.7287L23.5 20L17.75 23.2712Z" fill="#DCDCDC" />
        </g>
        <defs>
          <clipPath id="clip0_17388_90595">
            <rect width="22" height="15.5" fill="white" transform="translate(9 12.25)" />
          </clipPath>
        </defs>
      </svg>`,
      discord: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_17388_90592)">
          <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
          <path d="M28.3303 12.2278C26.7767 11.5009 25.1156 10.9727 23.3789 10.6719C23.1656 11.0575 22.9164 11.5761 22.7446 11.9887C20.8985 11.7111 19.0693 11.7111 17.2572 11.9887C17.0854 11.5761 16.8306 11.0575 16.6154 10.6719C14.8768 10.9727 13.2138 11.5029 11.6602 12.2317C8.52664 16.9669 7.67719 21.5845 8.10192 26.1365C10.1803 27.6885 12.1944 28.6313 14.1746 29.2483C14.6635 28.5754 15.0995 27.8601 15.4752 27.1063C14.7598 26.8344 14.0745 26.499 13.4271 26.1095C13.5988 25.9822 13.7669 25.8492 13.9292 25.7123C17.8782 27.5594 22.1689 27.5594 26.0707 25.7123C26.235 25.8492 26.403 25.9822 26.5728 26.1095C25.9235 26.5009 25.2364 26.8363 24.521 27.1082C24.8966 27.8601 25.3308 28.5774 25.8216 29.2502C27.8036 28.6333 29.8197 27.6905 31.898 26.1365C32.3964 20.8595 31.0467 16.2843 28.3303 12.2278ZM16.0132 23.337C14.8277 23.337 13.8556 22.2303 13.8556 20.8826C13.8556 19.535 14.807 18.4264 16.0132 18.4264C17.2194 18.4264 18.1916 19.533 18.1708 20.8826C18.1727 22.2303 17.2194 23.337 16.0132 23.337ZM23.9867 23.337C22.8013 23.337 21.8291 22.2303 21.8291 20.8826C21.8291 19.535 22.7805 18.4264 23.9867 18.4264C25.193 18.4264 26.1651 19.533 26.1444 20.8826C26.1444 22.2303 25.193 23.337 23.9867 23.337Z" fill="#DCDCDC" />
        </g>
        <defs>
          <clipPath id="clip0_17388_90592">
            <rect width="40" height="40" fill="white" />
          </clipPath>
        </defs>
      </svg>`,
      twitch: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_17388_90598)">
          <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
          <g clip-path="url(#clip1_17388_90598)">
            <path d="M10 29.7004C10 24.0502 10 18.4001 10 12.7464C10.0107 12.7176 10.0285 12.6852 10.0356 12.6528C10.3273 11.476 10.619 10.292 10.9072 9.10796C10.9285 9.02519 10.9605 9 11.0459 9C17.3284 9.0036 23.6073 9.0036 29.8862 9.0036C30 9.0036 30 9.0036 30 9.12236C30 13.4409 30 17.7595 30 22.0781C30 22.1501 29.9822 22.204 29.9289 22.2544C27.4991 24.7124 25.0694 27.1704 22.6396 29.6284C22.5827 29.686 22.5258 29.7076 22.4511 29.7076C21.2842 29.704 20.1174 29.7076 18.9506 29.704C18.8723 29.704 18.8154 29.7256 18.762 29.7831C18.0576 30.4993 17.3497 31.2155 16.6418 31.9316C16.6204 31.9532 16.6026 31.9784 16.5813 32C15.7844 32 14.9875 32 14.1907 32C14.1907 31.982 14.1942 31.9676 14.1942 31.9496C14.1942 31.2299 14.1942 30.5065 14.1942 29.7867C14.1942 29.7651 14.1907 29.7435 14.1871 29.704C14.1373 29.704 14.0911 29.704 14.0448 29.704C12.7357 29.704 11.4265 29.704 10.121 29.704C10.0818 29.704 10.0427 29.704 10 29.7004ZM16.9762 27.3719C17.0224 27.3287 17.0473 27.3072 17.0722 27.282C17.9474 26.3967 18.826 25.5113 19.7012 24.6224C19.751 24.5685 19.8043 24.5469 19.8755 24.5469C21.5155 24.5505 23.1555 24.5469 24.7954 24.5505C24.8666 24.5505 24.9128 24.5289 24.9626 24.4785C26.005 23.4204 27.0473 22.366 28.0932 21.3115C28.143 21.2611 28.1644 21.2108 28.1644 21.1424C28.1644 17.7595 28.1644 14.3766 28.1644 10.9937C28.1644 10.8714 28.1644 10.8714 28.047 10.8714C22.9989 10.8714 17.9509 10.8714 12.9029 10.8714C12.789 10.8714 12.789 10.8714 12.789 10.9865C12.789 15.4671 12.789 19.9512 12.789 24.4317C12.789 24.5505 12.789 24.5505 12.91 24.5505C14.2263 24.5505 15.5425 24.5505 16.8623 24.5505C16.9833 24.5505 16.9833 24.5505 16.9833 24.6692C16.9833 25.5293 16.9833 26.3859 16.9833 27.246C16.9762 27.2748 16.9762 27.3108 16.9762 27.3719Z" fill="#DCDCDC" />
            <path d="M17.9229 17.4822C17.9229 16.5825 17.9229 15.6792 17.9229 14.7795C17.9229 14.668 17.9229 14.668 18.0296 14.668C18.5739 14.668 19.1217 14.668 19.666 14.668C19.7478 14.668 19.7692 14.6896 19.7692 14.7723C19.7656 16.5789 19.7656 18.3891 19.7692 20.1957C19.7692 20.2749 19.7514 20.3001 19.6696 20.3001C19.1217 20.2965 18.5739 20.2965 18.026 20.3001C17.9478 20.3001 17.9229 20.2785 17.9229 20.1957C17.9229 19.2924 17.9229 18.3891 17.9229 17.4822Z" fill="#DCDCDC" />
            <path d="M23.0381 20.2962C23.0381 20.2494 23.0381 20.2134 23.0381 20.181C23.0381 18.3816 23.0381 16.5822 23.0381 14.7828C23.0381 14.6677 23.0381 14.6677 23.1484 14.6677C23.6927 14.6677 24.2334 14.6677 24.7777 14.6641C24.8631 14.6641 24.8844 14.6857 24.8844 14.772C24.8808 16.5786 24.8808 18.3816 24.8844 20.1882C24.8844 20.2746 24.8631 20.2962 24.7777 20.2962C24.2334 20.2926 23.6855 20.2926 23.1413 20.2926C23.1092 20.2962 23.0808 20.2962 23.0381 20.2962Z" fill="#DCDCDC" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_17388_90598">
            <rect width="40" height="40" fill="white" />
          </clipPath>
          <clipPath id="clip1_17388_90598">
            <rect width="20" height="23" fill="white" transform="translate(10 9)" />
          </clipPath>
        </defs>
      </svg>`,
      thread: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.5" fill="#4D4D4D" stroke="#999999" class="social_icons-circle" />
        <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 28C15.59 28 12 24.41 12 20C12 15.59 15.59 12 20 12C24.41 12 28 15.59 28 20C28 24.41 24.41 28 20 28Z" fill="#DCDCDC" />
      </svg>`
    };
    
    const svgIcon = svgIcons[link.platform] || svgIcons.facebook; // fallback to facebook if platform not found
    
    return `
      <li>
        <a href="${link.url}" target="_blank" aria-label="Follow us on ${altText} (open a new window)">
          ${svgIcon}
        </a>
      </li>
    `;
  }).join('');

  return `
    <div class='social'>
      <small class="text-social">${socialLabel}</small>
      <nav aria-label="Social media">
        <ul class='social__icons p-0 m-0'>
          ${socialIconsHTML}
        </ul>
      </nav>
    </div>
  `;
}

function buildFooterColumns(footerColumns) {
  return footerColumns.map(column => `
    <ul class='footer-links__column pl-0'>
      <li><p class="w-500">${column.columnTitle}</p></li>
      ${column.links.map(link => `<li><a href='${link.linkUrl}'>${link.linkText}</a></li>`).join('')}
    </ul>
  `).join('');
}

function buildLegalLinks(legalLinks) {
  return legalLinks.map(link => `
    <a href='${link.linkUrl}' target="_blank" aria-label="View ${link.linkText} (open a new window)">${link.linkText}</a>
  `).join('');
}

export default function decorate(block) {
}
