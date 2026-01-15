 1	// 화정동로데오부동산 - 공통 JavaScript 유틸리티
     2	
     3	// 세션 관리
     4	const Session = {
     5	    set: (key, value) => {
     6	        sessionStorage.setItem(key, JSON.stringify(value));
     7	    },
     8	    get: (key) => {
     9	        const value = sessionStorage.getItem(key);
    10	        return value ? JSON.parse(value) : null;
    11	    },
    12	    remove: (key) => {
    13	        sessionStorage.removeItem(key);
    14	    },
    15	    clear: () => {
    16	        sessionStorage.clear();
    17	    }
    18	};
    19	
    20	// 로그인한 사용자 정보
    21	const Auth = {
    22	    getCurrentUser: () => {
    23	        return Session.get('currentUser');
    24	    },
    25	    setCurrentUser: (user) => {
    26	        Session.set('currentUser', user);
    27	    },
    28	    logout: () => {
    29	        Session.clear();
    30	        window.location.href = 'login.html';
    31	    },
    32	    isAuthenticated: () => {
    33	        return !!Auth.getCurrentUser();
    34	    },
    35	    isAdmin: () => {
    36	        const user = Auth.getCurrentUser();
    37	        return user && user.role === 'admin';
    38	    },
    39	    requireAuth: () => {
    40	        if (!Auth.isAuthenticated()) {
    41	            window.location.href = 'login.html';
    42	        }
    43	    }
    44	};
    45	
    46	// API 호출 유틸리티
    47	const API = {
    48	    baseURL: (() => {
    49	        // 현재 URL 기준으로 API 경로 자동 감지
    50	        const currentPath = window.location.pathname;
    51	        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    52	        return basePath + 'tables/';
    53	    })(),
    54	    
    55	    // GET 요청
    56	    get: async (endpoint, params = {}) => {
    57	        try {
    58	            const queryString = new URLSearchParams(params).toString();
    59	            const url = `${API.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
    60	            const response = await fetch(url);
    61	            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    62	            return await response.json();
    63	        } catch (error) {
    64	            console.error('API GET Error:', error);
    65	            throw error;
    66	        }
    67	    },
    68	    
    69	    // POST 요청
    70	    post: async (endpoint, data) => {
    71	        try {
    72	            const response = await fetch(`${API.baseURL}${endpoint}`, {
    73	                method: 'POST',
    74	                headers: { 'Content-Type': 'application/json' },
    75	                body: JSON.stringify(data)
    76	            });
    77	            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    78	            return await response.json();
    79	        } catch (error) {
    80	            console.error('API POST Error:', error);
    81	            throw error;
    82	        }
    83	    },
    84	    
    85	    // PUT 요청
    86	    put: async (endpoint, data) => {
    87	        try {
    88	            const response = await fetch(`${API.baseURL}${endpoint}`, {
    89	                method: 'PUT',
    90	                headers: { 'Content-Type': 'application/json' },
    91	                body: JSON.stringify(data)
    92	            });
    93	            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    94	            return await response.json();
    95	        } catch (error) {
    96	            console.error('API PUT Error:', error);
    97	            throw error;
    98	        }
    99	    },
   100	    
   101	    // PATCH 요청
   102	    patch: async (endpoint, data) => {
   103	        try {
   104	            const response = await fetch(`${API.baseURL}${endpoint}`, {
   105	                method: 'PATCH',
   106	                headers: { 'Content-Type': 'application/json' },
   107	                body: JSON.stringify(data)
   108	            });
   109	            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
   110	            return await response.json();
   111	        } catch (error) {
   112	            console.error('API PATCH Error:', error);
   113	            throw error;
   114	        }
   115	    },
   116	    
   117	    // DELETE 요청
   118	    delete: async (endpoint) => {
   119	        try {
   120	            const response = await fetch(`${API.baseURL}${endpoint}`, {
   121	                method: 'DELETE'
   122	            });
   123	            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
   124	            return true;
   125	        } catch (error) {
   126	            console.error('API DELETE Error:', error);
   127	            throw error;
   128	        }
   129	    }
   130	};
   131	
   132	// 알림 표시
   133	const Toast = {
   134	    show: (message, type = 'success') => {
   135	        const toast = document.createElement('div');
   136	        toast.className = `alert alert-${type}`;
   137	        toast.textContent = message;
   138	        toast.style.position = 'fixed';
   139	        toast.style.top = '20px';
   140	        toast.style.right = '20px';
   141	        toast.style.zIndex = '10000';
   142	        toast.style.minWidth = '300px';
   143	        toast.style.animation = 'slideIn 0.3s ease';
   144	        
   145	        document.body.appendChild(toast);
   146	        
   147	        setTimeout(() => {
   148	            toast.style.animation = 'slideOut 0.3s ease';
   149	            setTimeout(() => toast.remove(), 300);
   150	        }, 3000);
   151	    },
   152	    success: (message) => Toast.show(message, 'success'),
   153	    error: (message) => Toast.show(message, 'error'),
   154	    warning: (message) => Toast.show(message, 'warning')
   155	};
   156	
   157	// 모달 관리
   158	const Modal = {
   159	    open: (modalId) => {
   160	        const modal = document.getElementById(modalId);
   161	        if (modal) {
   162	            modal.classList.add('active');
   163	            document.body.style.overflow = 'hidden';
   164	        }
   165	    },
   166	    close: (modalId) => {
   167	        const modal = document.getElementById(modalId);
   168	        if (modal) {
   169	            modal.classList.remove('active');
   170	            document.body.style.overflow = 'auto';
   171	        }
   172	    }
   173	};
   174	
   175	// 날짜 포맷팅
   176	const formatDate = (dateString, includeTime = false) => {
   177	    if (!dateString) return '';
   178	    const date = new Date(dateString);
   179	    const year = date.getFullYear();
   180	    const month = String(date.getMonth() + 1).padStart(2, '0');
   181	    const day = String(date.getDate()).padStart(2, '0');
   182	    
   183	    if (includeTime) {
   184	        const hours = String(date.getHours()).padStart(2, '0');
   185	        const minutes = String(date.getMinutes()).padStart(2, '0');
   186	        return `${year}-${month}-${day} ${hours}:${minutes}`;
   187	    }
   188	    
   189	    return `${year}-${month}-${day}`;
   190	};
   191	
   192	// 숫자 포맷팅 (천 단위 콤마)
   193	const formatNumber = (number) => {
   194	    if (!number && number !== 0) return '';
   195	    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   196	};
   197	
   198	// 금액 포맷팅
   199	const formatCurrency = (amount) => {
   200	    if (!amount && amount !== 0) return '0';
   201	    return `${formatNumber(amount)}만원`;
   202	};
   203	
   204	// 상태 배지 생성
   205	const getStatusBadge = (status) => {
   206	    const statusMap = {
   207	        '접수': 'info',
   208	        '진행중': 'warning',
   209	        '계약완료': 'success',
   210	        '보류': 'error',
   211	        '대기': 'info',
   212	        '포기': 'error'
   213	    };
   214	    const badgeClass = statusMap[status] || 'info';
   215	    return `<span class="badge badge-${badgeClass}">${status}</span>`;
   216	};
   217	
   218	// 네이버 지도 링크 생성
   219	const getNaverMapLink = (address) => {
   220	    if (!address) return '#';
   221	    return `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
   222	};
   223	
   224	// CSV 다운로드
   225	const downloadCSV = (data, filename) => {
   226	    if (!data || data.length === 0) {
   227	        Toast.warning('다운로드할 데이터가 없습니다.');
   228	        return;
   229	    }
   230	    
   231	    // CSV 헤더
   232	    const headers = Object.keys(data[0]);
   233	    const csvContent = [
   234	        headers.join(','),
   235	        ...data.map(row => 
   236	            headers.map(header => {
   237	                const value = row[header];
   238	                // 쉼표나 따옴표가 포함된 경우 처리
   239	                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
   240	                    return `"${value.replace(/"/g, '""')}"`;
   241	                }
   242	                return value;
   243	            }).join(',')
   244	        )
   245	    ].join('\n');
   246	    
   247	    // BOM 추가 (한글 깨짐 방지)
   248	    const BOM = '\uFEFF';
   249	    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
   250	    const link = document.createElement('a');
   251	    const url = URL.createObjectURL(blob);
   252	    
   253	    link.setAttribute('href', url);
   254	    link.setAttribute('download', `${filename}_${formatDate(new Date())}.csv`);
   255	    link.style.visibility = 'hidden';
   256	    document.body.appendChild(link);
   257	    link.click();
   258	    document.body.removeChild(link);
   259	};
   260	
   261	// 파일 업로드 (base64로 변환)
   262	const handleFileUpload = (file) => {
   263	    return new Promise((resolve, reject) => {
   264	        const reader = new FileReader();
   265	        reader.onload = (e) => {
   266	            resolve({
   267	                name: file.name,
   268	                type: file.type,
   269	                size: file.size,
   270	                data: e.target.result
   271	            });
   272	        };
   273	        reader.onerror = reject;
   274	        reader.readAsDataURL(file);
   275	    });
   276	};
   277	
   278	// 이미지 미리보기 생성
   279	const createImagePreview = (imageData, onRemove) => {
   280	    const container = document.createElement('div');
   281	    container.style.cssText = 'position:relative;display:inline-block;margin:8px;';
   282	    
   283	    const img = document.createElement('img');
   284	    img.src = imageData;
   285	    img.style.cssText = 'width:120px;height:120px;object-fit:cover;border-radius:8px;border:1px solid #E0E0E0;';
   286	    
   287	    const removeBtn = document.createElement('button');
   288	    removeBtn.innerHTML = '×';
   289	    removeBtn.style.cssText = 'position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;background:#FF3B30;color:white;border:none;cursor:pointer;font-size:18px;line-height:1;';
   290	    removeBtn.onclick = () => {
   291	        container.remove();
   292	        if (onRemove) onRemove();
   293	    };
   294	    
   295	    container.appendChild(img);
   296	    container.appendChild(removeBtn);
   297	    return container;
   298	};
   299	
   300	// 사이드바 토글 (모바일)
   301	const initMobileMenu = () => {
   302	    const menuBtn = document.querySelector('.mobile-menu-btn');
   303	    const sidebar = document.querySelector('.sidebar');
   304	    const overlay = document.createElement('div');
   305	    overlay.className = 'sidebar-overlay';
   306	    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:998;';
   307	    
   308	    if (menuBtn && sidebar) {
   309	        document.body.appendChild(overlay);
   310	        
   311	        menuBtn.addEventListener('click', () => {
   312	            sidebar.classList.toggle('active');
   313	            overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
   314	        });
   315	        
   316	        overlay.addEventListener('click', () => {
   317	            sidebar.classList.remove('active');
   318	            overlay.style.display = 'none';
   319	        });
   320	    }
   321	};
   322	
   323	// 페이지 로드 시 실행
   324	document.addEventListener('DOMContentLoaded', () => {
   325	    initMobileMenu();
   326	    
   327	    // 로그아웃 버튼
   328	    const logoutBtn = document.querySelector('.logout-btn');
   329	    if (logoutBtn) {
   330	        logoutBtn.addEventListener('click', () => {
   331	            if (confirm('로그아웃 하시겠습니까?')) {
   332	                Auth.logout();
   333	            }
   334	        });
   335	    }
   336	    
   337	    // 사용자 정보 표시
   338	    const user = Auth.getCurrentUser();
   339	    if (user) {
   340	        const userName = document.querySelector('.user-name');
   341	        const userRole = document.querySelector('.user-role');
   342	        if (userName) userName.textContent = user.name;
   343	        if (userRole) userRole.textContent = user.role === 'admin' ? '관리자' : '직원';
   344	    }
   345	});
   346	
   347	// CSS 애니메이션 추가
   348	const style = document.createElement('style');
   349	style.textContent = `
   350	    @keyframes slideIn {
   351	        from {
   352	            transform: translateX(400px);
   353	            opacity: 0;
   354	        }
   355	        to {
   356	            transform: translateX(0);
   357	            opacity: 1;
   358	        }
   359	    }
   360	    
   361	    @keyframes slideOut {
   362	        from {
   363	            transform: translateX(0);
   364	            opacity: 1;
   365	        }
   366	        to {
   367	            transform: translateX(400px);
   368	            opacity: 0;
   369	        }
   370	    }
   371	`;
   372	document.head.appendChild(style);
   373	