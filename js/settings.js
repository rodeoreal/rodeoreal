 1	// 설정 페이지 JavaScript
     2	
     3	Auth.requireAuth();
     4	
     5	// 관리자 권한 확인
     6	if (!Auth.isAdmin()) {
     7	    Toast.error('관리자만 접근할 수 있습니다.');
     8	    window.location.href = 'index.html';
     9	}
    10	
    11	// 사용자 정보 표시
    12	const user = Auth.getCurrentUser();
    13	if (user) {
    14	    const userInitial = document.getElementById('userInitial');
    15	    if (userInitial) userInitial.textContent = user.name.charAt(0);
    16	}
    17	
    18	// 전역 변수
    19	let allStaff = [];
    20	let currentEditStaffId = null;
    21	
    22	// 페이지 로드
    23	document.addEventListener('DOMContentLoaded', () => {
    24	    loadStaff();
    25	    loadSystemInfo();
    26	    loadNotificationSettings();
    27	    setupNotificationToggles();
    28	});
    29	
    30	// 직원 목록 불러오기
    31	async function loadStaff() {
    32	    try {
    33	        const response = await API.get('staff');
    34	        allStaff = response.data || [];
    35	        renderStaff(allStaff);
    36	    } catch (error) {
    37	        console.error('Load staff error:', error);
    38	        Toast.error('직원 정보를 불러오는 중 오류가 발생했습니다.');
    39	    }
    40	}
    41	
    42	// 직원 목록 렌더링
    43	function renderStaff(staff) {
    44	    const tbody = document.getElementById('staffTableBody');
    45	    
    46	    if (!staff || staff.length === 0) {
    47	        tbody.innerHTML = `
    48	            <tr>
    49	                <td colspan="7" style="text-align: center; padding: 20px;">등록된 직원이 없습니다</td>
    50	            </tr>
    51	        `;
    52	        return;
    53	    }
    54	    
    55	    tbody.innerHTML = staff.map(s => `
    56	        <tr>
    57	            <td>${s.name || '-'}</td>
    58	            <td>${s.email || '-'}</td>
    59	            <td>${s.phone || '-'}</td>
    60	            <td>
    61	                <span class="badge ${s.role === 'admin' ? 'badge-error' : 'badge-info'}">
    62	                    ${s.role === 'admin' ? '관리자' : '일반'}
    63	                </span>
    64	            </td>
    65	            <td>
    66	                <span class="badge ${s.is_active ? 'badge-success' : 'badge-error'}">
    67	                    ${s.is_active ? '활성' : '비활성'}
    68	                </span>
    69	            </td>
    70	            <td>${s.last_login ? formatDate(s.last_login, true) : '로그인 기록 없음'}</td>
    71	            <td>
    72	                <button class="btn btn-sm" onclick="editStaff('${s.id}')" style="margin-right: 4px;">
    73	                    <i class="fas fa-edit"></i>
    74	                </button>
    75	                ${s.id !== user.id ? `
    76	                    <button class="btn btn-sm" onclick="deleteStaff('${s.id}')" style="background: var(--error-color); color: white;">
    77	                        <i class="fas fa-trash"></i>
    78	                    </button>
    79	                ` : ''}
    80	            </td>
    81	        </tr>
    82	    `).join('');
    83	}
    84	
    85	// 직원 추가 모달 열기
    86	function openAddStaffModal() {
    87	    currentEditStaffId = null;
    88	    
    89	    document.getElementById('modalTitle').textContent = '직원 추가';
    90	    document.getElementById('staffForm').reset();
    91	    document.getElementById('staffId').value = '';
    92	    document.getElementById('staffActive').checked = true;
    93	    document.getElementById('staffPassword').required = true;
    94	    
    95	    Modal.open('staffModal');
    96	}
    97	
    98	// 직원 수정 모달 열기
    99	function editStaff(id) {
   100	    const staff = allStaff.find(s => s.id === id);
   101	    if (!staff) return;
   102	    
   103	    currentEditStaffId = id;
   104	    
   105	    document.getElementById('modalTitle').textContent = '직원 정보 수정';
   106	    document.getElementById('staffId').value = id;
   107	    document.getElementById('staffName').value = staff.name || '';
   108	    document.getElementById('staffEmail').value = staff.email || '';
   109	    document.getElementById('staffPhone').value = staff.phone || '';
   110	    document.getElementById('staffRole').value = staff.role || 'staff';
   111	    document.getElementById('staffActive').checked = staff.is_active !== false;
   112	    document.getElementById('staffPassword').value = '';
   113	    document.getElementById('staffPassword').required = false;
   114	    
   115	    Modal.open('staffModal');
   116	}
   117	
   118	// 직원 저장
   119	async function saveStaff() {
   120	    const form = document.getElementById('staffForm');
   121	    if (!form.checkValidity()) {
   122	        form.reportValidity();
   123	        return;
   124	    }
   125	    
   126	    const password = document.getElementById('staffPassword').value;
   127	    
   128	    // 비밀번호 검증 (신규 또는 변경 시)
   129	    if (!currentEditStaffId || password) {
   130	        if (password.length < 8) {
   131	            Toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
   132	            return;
   133	        }
   134	    }
   135	    
   136	    const staffData = {
   137	        name: document.getElementById('staffName').value,
   138	        email: document.getElementById('staffEmail').value,
   139	        phone: document.getElementById('staffPhone').value,
   140	        role: document.getElementById('staffRole').value,
   141	        is_active: document.getElementById('staffActive').checked
   142	    };
   143	    
   144	    // 비밀번호가 입력된 경우에만 추가
   145	    if (password) {
   146	        staffData.password = password;
   147	    }
   148	    
   149	    try {
   150	        if (currentEditStaffId) {
   151	            // 수정
   152	            await API.put(`staff/${currentEditStaffId}`, staffData);
   153	            Toast.success('직원 정보가 수정되었습니다.');
   154	        } else {
   155	            // 신규 등록
   156	            staffData.id = 'staff' + Date.now();
   157	            await API.post('staff', staffData);
   158	            Toast.success('새 직원이 추가되었습니다.');
   159	        }
   160	        
   161	        closeStaffModal();
   162	        loadStaff();
   163	    } catch (error) {
   164	        console.error('Save staff error:', error);
   165	        Toast.error('저장 중 오류가 발생했습니다.');
   166	    }
   167	}
   168	
   169	// 직원 삭제
   170	async function deleteStaff(id) {
   171	    if (id === user.id) {
   172	        Toast.error('본인 계정은 삭제할 수 없습니다.');
   173	        return;
   174	    }
   175	    
   176	    if (!confirm('정말 삭제하시겠습니까?')) return;
   177	    
   178	    try {
   179	        await API.delete(`staff/${id}`);
   180	        Toast.success('직원이 삭제되었습니다.');
   181	        loadStaff();
   182	    } catch (error) {
   183	        console.error('Delete staff error:', error);
   184	        Toast.error('삭제 중 오류가 발생했습니다.');
   185	    }
   186	}
   187	
   188	// 모달 닫기
   189	function closeStaffModal() {
   190	    Modal.close('staffModal');
   191	    currentEditStaffId = null;
   192	}
   193	
   194	// 시스템 정보 로드
   195	async function loadSystemInfo() {
   196	    try {
   197	        const [staff, rental, sale] = await Promise.all([
   198	            API.get('staff'),
   199	            API.get('rental_properties'),
   200	            API.get('sale_properties')
   201	        ]);
   202	        
   203	        document.getElementById('totalStaff').textContent = (staff.total || 0) + '명';
   204	        document.getElementById('totalRental').textContent = (rental.total || 0) + '건';
   205	        document.getElementById('totalSale').textContent = (sale.total || 0) + '건';
   206	    } catch (error) {
   207	        console.error('Load system info error:', error);
   208	    }
   209	}
   210	
   211	// 알림 설정 불러오기
   212	function loadNotificationSettings() {
   213	    const settings = Session.get('notificationSettings') || {
   214	        push: false,
   215	        email: false,
   216	        sms: false
   217	    };
   218	    
   219	    document.getElementById('pushNotification').checked = settings.push;
   220	    document.getElementById('emailNotification').checked = settings.email;
   221	    // SMS는 준비중
   222	}
   223	
   224	// 알림 토글 설정
   225	function setupNotificationToggles() {
   226	    document.getElementById('pushNotification').addEventListener('change', (e) => {
   227	        saveNotificationSetting('push', e.target.checked);
   228	        if (e.target.checked) {
   229	            Toast.success('웹 푸시 알림이 활성화되었습니다.');
   230	        } else {
   231	            Toast.warning('웹 푸시 알림이 비활성화되었습니다.');
   232	        }
   233	    });
   234	    
   235	    document.getElementById('emailNotification').addEventListener('change', (e) => {
   236	        saveNotificationSetting('email', e.target.checked);
   237	        if (e.target.checked) {
   238	            Toast.success('이메일 알림이 활성화되었습니다.');
   239	        } else {
   240	            Toast.warning('이메일 알림이 비활성화되었습니다.');
   241	        }
   242	    });
   243	}
   244	
   245	// 알림 설정 저장
   246	function saveNotificationSetting(type, value) {
   247	    const settings = Session.get('notificationSettings') || {
   248	        push: false,
   249	        email: false,
   250	        sms: false
   251	    };
   252	    
   253	    settings[type] = value;
   254	    Session.set('notificationSettings', settings);
   255	}
   256	
   257	// 토글 스위치 CSS
   258	const style = document.createElement('style');
   259	style.textContent = `
   260	    input:checked + span {
   261	        background-color: var(--naver-green) !important;
   262	    }
   263	    
   264	    input + span:before {
   265	        position: absolute;
   266	        content: "";
   267	        height: 18px;
   268	        width: 18px;
   269	        left: 3px;
   270	        bottom: 3px;
   271	        background-color: white;
   272	        transition: .4s;
   273	        border-radius: 50%;
   274	    }
   275	    
   276	    input:checked + span:before {
   277	        transform: translateX(26px);
   278	    }
   279	    
   280	    input:disabled + span {
   281	        cursor: not-allowed !important;
   282	    }
   283	`;
   284	document.head.appendChild(style);
   285	