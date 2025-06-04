import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({user, userDB}) => {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Сохраняем начальную высоту окна
        const initialHeight = window.innerHeight;

        // Функция для обработки изменения размеров видимой области
        const handleResize = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const isKeyboardActive = viewportHeight < initialHeight * 0.7; // Порог 70%
            setIsKeyboardOpen(isKeyboardActive);
        };

        // Подписываемся на событие resize visualViewport
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        // Также подписываемся на resize window (для совместимости)
        window.addEventListener('resize', handleResize);

        // Очистка подписок при размонтировании компонента
        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };
    return (
        <>
            <div className='headerContainer'>
                <div className='headerLeft'>
                    <div className='arrowBack' onClick={handleGoBack}>
                        <span>
                            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 3L9 12L16 21" stroke="black" stroke-width="1.5"/>
                            </svg>
                        </span>
                        <span>
                            Назад
                        </span>
                    </div>
                    {
                        userDB?.user_data.role == 1 && (
                            <a className='adminLink' onClick={() => navigate('/admin/users')}>Панель управления</a>
                        )
                    }
                    <a onClick={() => navigate('/user-info')} className='headerAvatar'>
                        <span><img src={user?.photo_url} /></span>
                        <span>Профиль</span>
                    </a>
                </div>
                {/* <div className='headerNotif'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13.7334 21C13.5576 21.3031 13.3053 21.5547 13.0017 21.7295C12.698 21.9044 12.3538 21.9965 12.0034 21.9965C11.6531 21.9965 11.3088 21.9044 11.0052 21.7295C10.7016 21.5547 10.4492 21.3031 10.2734 21" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div> */}
            </div>
            {!isKeyboardOpen && (
            <div className='bottomMenu'>
                <a onClick={() => navigate('')} className='bottomMenuIconContainer'>
                    <div className='bottomMenuIcon'>
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.19922 12.4L16.9992 4L27.7991 12.4V25.6C27.7991 26.2365 27.5463 26.8469 27.0962 27.297C26.6462 27.7471 26.0357 28 25.3991 28H8.59921C7.9627 28 7.35225 27.7471 6.90216 27.297C6.45207 26.8469 6.19922 26.2365 6.19922 25.6V12.4Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.3984 28V16H20.5984V28" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div className='bottomMenuIconText'>Главная</div>
                </a>
                <a onClick={() => navigate('/events')} className='bottomMenuIconContainer'>
                    <div className='bottomMenuIcon'>
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.3992 7.39844H8.59922C7.27373 7.39844 6.19922 8.47295 6.19922 9.79844V26.5984C6.19922 27.924 7.27373 28.9984 8.59922 28.9984H25.3992C26.7247 28.9984 27.7992 27.924 27.7992 26.5984V9.79844C27.7992 8.47295 26.7247 7.39844 25.3992 7.39844Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21.8008 5V9.8" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.1992 5V9.8" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.19922 14.6016H27.7992" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div className='bottomMenuIconText'>События</div>
                </a>
                <a onClick={() => navigate('/tasks')} className='bottomMenuIconContainer'>
                    <div className='bottomMenuIcon'>
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.2617 15.7871L15.8937 19.4191L28.0003 7.3125" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M26.788 17.0014V25.4761C26.788 26.1182 26.5329 26.7341 26.0788 27.1882C25.6247 27.6423 25.0088 27.8974 24.3667 27.8974H7.41742C6.77525 27.8974 6.15937 27.6423 5.70529 27.1882C5.25119 26.7341 4.99609 26.1182 4.99609 25.4761V8.5268C4.99609 7.88462 5.25119 7.26875 5.70529 6.81466C6.15937 6.36057 6.77525 6.10547 7.41742 6.10547H20.7347" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div className='bottomMenuIconText'>Задачи</div>
                </a>
                <a onClick={() => navigate('/notes')} className='bottomMenuIconContainer'>
                    <div className='bottomMenuIcon'>
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M26 28L17 21.8889L8 28V8.44444C8 7.79614 8.27091 7.17438 8.75316 6.71597C9.23539 6.25753 9.88945 6 10.5714 6H23.4286C24.1105 6 24.7646 6.25753 25.2468 6.71597C25.7291 7.17438 26 7.79614 26 8.44444V28Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div className='bottomMenuIconText'>Заметки</div>
                </a>
            </div>
            )}
        </>
    );
};

export default Header;