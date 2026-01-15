1	// 임대 물건 관리 JavaScript
     2	
     3	Auth.requireAuth();
     4	
     5	// 관리자인 경우 설정 메뉴 표시
     6	if (Auth.isAdmin()) {
     7	    const settingsNav = document.getElementById('settingsNav');
     8	    if (settingsNav) settingsNav.style.display = 'flex';
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
    19	let allProperties = [];
    20	let currentEditId = null;
    21	let uploadedPhotos = [];
    22	let uploadedFiles = [];
    23	
    24	// 페이지 로드 시 데이터 불러오기
    25	document.addEventListener('DOMContentLoaded', () => {
    26	    loadProperties();
    27	    setupEventListeners();
    28	    setupFileUploads();
    29	    
    30	    // 오늘 날짜를 기본값으로 설정
    31	    document.getElementById('receivedDate').valueAsDate = new Date();
    32	});
    33	
    34	// 이벤트 리스너 설정
    35	function setupEventListeners() {
    36	    const searchInput = document.getElementById('searchInput');
    37	    const statusFilter = document.getElementById('statusFilter');
    38	    const floorFilter = document.getElementById('floorFilter');
    39	    
    40	    searchInput.addEventListener('input', filterProperties);
    41	    statusFilter.addEventListener('change', filterProperties);
    42	    floorFilter.addEventListener('change', filterProperties);
    43	}
    44	
    45	// 파일 업로드 설정
    46	function setupFileUploads() {
    47	    const photoUpload = document.getElementById('photoUpload');
    48	    const fileUpload = document.getElementById('fileUpload');
    49	    
    50	    photoUpload.addEventListener('change', async (e) => {
    51	        const files = Array.from(e.target.files);
    52	        for (const file of files) {
    53	            if (file.type.startsWith('image/')) {
    54	                const data = await handleFileUpload(file);
    55	                uploadedPhotos.push(data.data);
    56	                
    57	                const preview = createImagePreview(data.data, () => {
    58	                    uploadedPhotos = uploadedPhotos.filter(p => p !== data.data);
    59	                });
    60	                document.getElementById('photoPreview').appendChild(preview);
    61	            }
    62	        }
    63	        photoUpload.value = '';
    64	    });
    65	    
    66	    fileUpload.addEventListener('change', async (e) => {
    67	        const files = Array.from(e.target.files);
    68	        const fileList = document.getElementById('fileList');
    69	        
    70	        for (const file of files) {
    71	            const data = await handleFileUpload(file);
    72	            uploadedFiles.push(data);
    73	            
    74	            const fileItem = document.createElement('div');
    75	            fileItem.style.cssText = 'padding:8px;background:#F8F9FA;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;';
    76	            fileItem.innerHTML = `
    77	                <span><i class="fas fa-file"></i> ${file.name}</span>
    78	                <button type="button" class="btn btn-sm" style="padding:4px 8px;" onclick="this.parentElement.remove()">
    79	                    <i class="fas fa-times"></i>
    80	                </button>
    81	            `;
    82	            fileList.appendChild(fileItem);
    83	        }
    84	        fileUpload.value = '';
    85	    });
    86	}
    87	
    88	// 물건 목록 불러오기
    89	async function loadProperties() {
    90	    try {
    91	        const response = await API.get('rental_properties', { limit: 1000, sort: '-created_at' });
    92	        allProperties = response.data || [];
    93	        renderProperties(allProperties);
    94	    } catch (error) {
    95	        console.error('Load properties error:', error);
    96	        Toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
    97	        document.getElementById('rentalTableBody').innerHTML = `
    98	            <tr>
    99	                <td colspan="12" style="text-align: center; padding: 40px; color: var(--error-color);">
   100	                    데이터를 불러올 수 없습니다.
   101	                </td>
   102	            </tr>
   103	        `;
   104	    }
   105	}
   106	
   107	// 물건 목록 렌더링
   108	function renderProperties(properties) {
   109	    const tbody = document.getElementById('rentalTableBody');
   110	    
   111	    if (!properties || properties.length === 0) {
   112	        tbody.innerHTML = `
   113	            <tr>
   114	                <td colspan="12" style="text-align: center; padding: 40px;">
   115	                    <div class="empty-state">
   116	                        <div class="empty-state-icon">📦</div>
   117	                        <div class="empty-state-text">등록된 임대 물건이 없습니다</div>
   118	                        <button class="btn btn-primary" onclick="openAddModal()" style="margin-top: 16px;">
   119	                            물건 등록하기
   120	                        </button>
   121	                    </div>
   122	                </td>
   123	            </tr>
   124	        `;
   125	        return;
   126	    }
   127	    
   128	    tbody.innerHTML = properties.map(property => `
   129	        <tr>
   130	            <td>${property.store_name || '-'}</td>
   131	            <td>${property.business_type || '-'}</td>
   132	            <td>${property.building_name || '-'}</td>
   133	            <td>${property.floor || '-'}</td>
   134	            <td>${property.actual_area || 0}평</td>
   135	            <td>${property.rental_area || 0}평</td>
   136	            <td>${formatCurrency(property.deposit || 0)}</td>
   137	            <td>${formatCurrency(property.monthly_rent || 0)}</td>
   138	            <td>${formatCurrency(property.premium || 0)}</td>
   139	            <td>${formatDate(property.received_date)}</td>
   140	            <td>${getStatusBadge(property.status || '접수')}</td>
   141	            <td>
   142	                <button class="btn btn-sm" onclick="viewDetail('${property.id}')" style="margin-right: 4px;">
   143	                    <i class="fas fa-eye"></i>
   144	                </button>
   145	                <button class="btn btn-sm" onclick="editProperty('${property.id}')" style="margin-right: 4px;">
   146	                    <i class="fas fa-edit"></i>
   147	                </button>
   148	                <button class="btn btn-sm" onclick="deleteProperty('${property.id}')" style="background: var(--error-color); color: white;">
   149	                    <i class="fas fa-trash"></i>
   150	                </button>
   151	            </td>
   152	        </tr>
   153	    `).join('');
   154	}
   155	
   156	// 필터링
   157	function filterProperties() {
   158	    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
   159	    const statusFilter = document.getElementById('statusFilter').value;
   160	    const floorFilter = document.getElementById('floorFilter').value;
   161	    
   162	    let filtered = allProperties;
   163	    
   164	    // 검색어 필터
   165	    if (searchTerm) {
   166	        filtered = filtered.filter(p => 
   167	            (p.store_name || '').toLowerCase().includes(searchTerm) ||
   168	            (p.building_name || '').toLowerCase().includes(searchTerm) ||
   169	            (p.business_type || '').toLowerCase().includes(searchTerm)
   170	        );
   171	    }
   172	    
   173	    // 상태 필터
   174	    if (statusFilter) {
   175	        filtered = filtered.filter(p => p.status === statusFilter);
   176	    }
   177	    
   178	    // 층 필터
   179	    if (floorFilter) {
   180	        filtered = filtered.filter(p => {
   181	            const floor = (p.floor || '').toLowerCase();
   182	            if (floorFilter === '지하') return floor.includes('지하');
   183	            if (floorFilter === '1층') return floor.includes('1층');
   184	            if (floorFilter === '2층') return floor.includes('2층');
   185	            if (floorFilter === '3층 이상') return floor.match(/[3-9]\d*층/);
   186	            return true;
   187	        });
   188	    }
   189	    
   190	    renderProperties(filtered);
   191	}
   192	
   193	// 등록 모달 열기
   194	function openAddModal() {
   195	    currentEditId = null;
   196	    uploadedPhotos = [];
   197	    uploadedFiles = [];
   198	    
   199	    document.getElementById('modalTitle').textContent = '임대 물건 등록';
   200	    document.getElementById('rentalForm').reset();
   201	    document.getElementById('propertyId').value = '';
   202	    document.getElementById('photoPreview').innerHTML = '';
   203	    document.getElementById('fileList').innerHTML = '';
   204	    document.getElementById('receivedDate').valueAsDate = new Date();
   205	    
   206	    Modal.open('rentalModal');
   207	}
   208	
   209	// 수정 모달 열기
   210	async function editProperty(id) {
   211	    try {
   212	        const property = allProperties.find(p => p.id === id);
   213	        if (!property) throw new Error('Property not found');
   214	        
   215	        currentEditId = id;
   216	        uploadedPhotos = property.photos || [];
   217	        uploadedFiles = property.files || [];
   218	        
   219	        document.getElementById('modalTitle').textContent = '임대 물건 수정';
   220	        document.getElementById('propertyId').value = id;
   221	        document.getElementById('storeName').value = property.store_name || '';
   222	        document.getElementById('businessType').value = property.business_type || '';
   223	        document.getElementById('buildingName').value = property.building_name || '';
   224	        document.getElementById('address').value = property.address || '';
   225	        document.getElementById('receivedDate').value = property.received_date ? property.received_date.split('T')[0] : '';
   226	        document.getElementById('floor').value = property.floor || '';
   227	        document.getElementById('actualArea').value = property.actual_area || '';
   228	        document.getElementById('rentalArea').value = property.rental_area || '';
   229	        document.getElementById('deposit').value = property.deposit || '';
   230	        document.getElementById('monthlyRent').value = property.monthly_rent || '';
   231	        document.getElementById('premium').value = property.premium || '';
   232	        document.getElementById('status').value = property.status || '접수';
   233	        document.getElementById('memo').value = property.memo || '';
   234	        
   235	        // 사진 미리보기
   236	        const photoPreview = document.getElementById('photoPreview');
   237	        photoPreview.innerHTML = '';
   238	        if (property.photos && property.photos.length > 0) {
   239	            property.photos.forEach(photo => {
   240	                const preview = createImagePreview(photo, () => {
   241	                    uploadedPhotos = uploadedPhotos.filter(p => p !== photo);
   242	                });
   243	                photoPreview.appendChild(preview);
   244	            });
   245	        }
   246	        
   247	        // 파일 목록
   248	        const fileList = document.getElementById('fileList');
   249	        fileList.innerHTML = '';
   250	        if (property.files && property.files.length > 0) {
   251	            property.files.forEach(file => {
   252	                const fileItem = document.createElement('div');
   253	                fileItem.style.cssText = 'padding:8px;background:#F8F9FA;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;';
   254	                fileItem.innerHTML = `
   255	                    <span><i class="fas fa-file"></i> ${file.name || '파일'}</span>
   256	                    <button type="button" class="btn btn-sm" style="padding:4px 8px;" onclick="this.parentElement.remove()">
   257	                        <i class="fas fa-times"></i>
   258	                    </button>
   259	                `;
   260	                fileList.appendChild(fileItem);
   261	            });
   262	        }
   263	        
   264	        Modal.open('rentalModal');
   265	    } catch (error) {
   266	        console.error('Edit property error:', error);
   267	        Toast.error('물건 정보를 불러오는 중 오류가 발생했습니다.');
   268	    }
   269	}
   270	
   271	// 저장
   272	async function saveProperty() {
   273	    const form = document.getElementById('rentalForm');
   274	    if (!form.checkValidity()) {
   275	        form.reportValidity();
   276	        return;
   277	    }
   278	    
   279	    const propertyData = {
   280	        store_name: document.getElementById('storeName').value,
   281	        business_type: document.getElementById('businessType').value,
   282	        building_name: document.getElementById('buildingName').value,
   283	        address: document.getElementById('address').value,
   284	        received_date: new Date(document.getElementById('receivedDate').value).toISOString(),
   285	        floor: document.getElementById('floor').value,
   286	        actual_area: parseFloat(document.getElementById('actualArea').value) || 0,
   287	        rental_area: parseFloat(document.getElementById('rentalArea').value) || 0,
   288	        deposit: parseFloat(document.getElementById('deposit').value) || 0,
   289	        monthly_rent: parseFloat(document.getElementById('monthlyRent').value) || 0,
   290	        premium: parseFloat(document.getElementById('premium').value) || 0,
   291	        status: document.getElementById('status').value,
   292	        memo: document.getElementById('memo').value,
   293	        photos: uploadedPhotos,
   294	        files: uploadedFiles,
   295	        created_by: user.id
   296	    };
   297	    
   298	    try {
   299	        if (currentEditId) {
   300	            // 수정
   301	            await API.put(`rental_properties/${currentEditId}`, propertyData);
   302	            Toast.success('물건 정보가 수정되었습니다.');
   303	        } else {
   304	            // 등록
   305	            await API.post('rental_properties', propertyData);
   306	            Toast.success('새 물건이 등록되었습니다.');
   307	        }
   308	        
   309	        closeModal();
   310	        loadProperties();
   311	    } catch (error) {
   312	        console.error('Save property error:', error);
   313	        Toast.error('저장 중 오류가 발생했습니다.');
   314	    }
   315	}
   316	
   317	// 삭제
   318	async function deleteProperty(id) {
   319	    if (!confirm('정말 삭제하시겠습니까?')) return;
   320	    
   321	    try {
   322	        await API.delete(`rental_properties/${id}`);
   323	        Toast.success('물건이 삭제되었습니다.');
   324	        loadProperties();
   325	    } catch (error) {
   326	        console.error('Delete property error:', error);
   327	        Toast.error('삭제 중 오류가 발생했습니다.');
   328	    }
   329	}
   330	
   331	// 상세보기
   332	function viewDetail(id) {
   333	    const property = allProperties.find(p => p.id === id);
   334	    if (!property) return;
   335	    
   336	    const detailContent = document.getElementById('detailContent');
   337	    detailContent.innerHTML = `
   338	        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
   339	            <div>
   340	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">기본 정보</h3>
   341	                <p><strong>상호:</strong> ${property.store_name || '-'}</p>
   342	                <p><strong>업종:</strong> ${property.business_type || '-'}</p>
   343	                <p><strong>건물명:</strong> ${property.building_name || '-'}</p>
   344	                <p><strong>주소:</strong> ${property.address || '-'} 
   345	                    ${property.address ? `<a href="${getNaverMapLink(property.address)}" target="_blank" class="btn btn-sm" style="margin-left: 8px;"><i class="fas fa-map-marker-alt"></i> 지도</a>` : ''}
   346	                </p>
   347	                <p><strong>층:</strong> ${property.floor || '-'}</p>
   348	                <p><strong>접수일:</strong> ${formatDate(property.received_date)}</p>
   349	                <p><strong>상태:</strong> ${getStatusBadge(property.status || '접수')}</p>
   350	            </div>
   351	            <div>
   352	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">금액 정보</h3>
   353	                <p><strong>실면적:</strong> ${property.actual_area || 0}평</p>
   354	                <p><strong>임대면적:</strong> ${property.rental_area || 0}평</p>
   355	                <p><strong>보증금:</strong> ${formatCurrency(property.deposit || 0)}</p>
   356	                <p><strong>월세:</strong> ${formatCurrency(property.monthly_rent || 0)}</p>
   357	                <p><strong>권리금:</strong> ${formatCurrency(property.premium || 0)}</p>
   358	            </div>
   359	        </div>
   360	        
   361	        ${property.memo ? `
   362	            <div style="margin-top: 20px;">
   363	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">메모</h3>
   364	                <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; white-space: pre-wrap;">
   365	                    ${property.memo}
   366	                </div>
   367	            </div>
   368	        ` : ''}
   369	        
   370	        ${property.photos && property.photos.length > 0 ? `
   371	            <div style="margin-top: 20px;">
   372	                <h3 style="margin-bottom: 16px; color: var(--naver-green);">사진</h3>
   373	                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
   374	                    ${property.photos.map(photo => `
   375	                        <img src="${photo}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.open('${photo}', '_blank')">
   376	                    `).join('')}
   377	                </div>
   378	            </div>
   379	        ` : ''}
   380	        
   381	        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
   382	            <p style="font-size: 13px; color: var(--text-secondary);">등록일: ${formatDate(property.created_at, true)}</p>
   383	            <p style="font-size: 13px; color: var(--text-secondary);">수정일: ${formatDate(property.updated_at, true)}</p>
   384	        </div>
   385	    `;
   386	    
   387	    Modal.open('detailModal');
   388	}
   389	
   390	// 모달 닫기
   391	function closeModal() {
   392	    Modal.close('rentalModal');
   393	    currentEditId = null;
   394	    uploadedPhotos = [];
   395	    uploadedFiles = [];
   396	}
   397	
   398	// 내보내기
   399	function exportData() {
   400	    if (allProperties.length === 0) {
   401	        Toast.warning('내보낼 데이터가 없습니다.');
   402	        return;
   403	    }
   404	    
   405	    const exportData = allProperties.map(p => ({
   406	        '상호': p.store_name || '',
   407	        '업종': p.business_type || '',
   408	        '건물명': p.building_name || '',
   409	        '주소': p.address || '',
   410	        '층': p.floor || '',
   411	        '실면적(평)': p.actual_area || 0,
   412	        '임대면적(평)': p.rental_area || 0,
   413	        '보증금(만원)': p.deposit || 0,
   414	        '월세(만원)': p.monthly_rent || 0,
   415	        '권리금(만원)': p.premium || 0,
   416	        '접수일': formatDate(p.received_date),
   417	        '상태': p.status || '',
   418	        '메모': p.memo || ''
   419	    }));
   420	    
   421	    downloadCSV(exportData, '임대물건목록');
   422	}
   423	