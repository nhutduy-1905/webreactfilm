import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Card,
  Space, Tooltip, Typography, Affix, Alert, Tag as AntTag,
} from 'antd';
import {
  SaveOutlined, SendOutlined, CloseOutlined,
  InfoCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import type { Movie } from '../lib/api';
import { movieApi } from '../lib/api';

const { TextArea } = Input;
const { Text } = Typography;

const CATEGORIES = [
  'Hành động',
  'Hài',
  'Tình cảm',
  'Kinh dị',
  'Tâm linh',
  'Tâm lý',
  'Khoa học viễn tưởng',
  'Phiêu lưu',
  'Hoạt hình',
  'Gia đình',
  'Tội phạm',
  'Bí ẩn',
  'Lịch sử',
  'Chiến tranh',
  'Tiểu sử',
  'Chính kịch',
  'Thể thao',
  'Âm nhạc',
  'Tài liệu',
  'Trinh thám',
  'Viễn tưởng',
  'Series',
  'Thần thoại',
  'Cổ trang',
  'Học đường',
  'Kinh điển',
];
const AGE_RATINGS: { value: string; label: string; desc: string }[] = [
  { value: 'P', label: 'P', desc: 'Phổ biến cho mọi đối tượng' },
  { value: 'T13', label: 'T13', desc: 'Từ 13 tuổi trở lên' },
  { value: 'T16', label: 'T16', desc: 'Từ 16 tuổi trở lên' },
  { value: 'T18', label: 'T18', desc: 'Từ 18 tuổi trở lên' },
  { value: 'C', label: 'C', desc: 'Cấm phổ biến' },
];

const LANGUAGES = [
  'Tiếng Việt', 'Tiếng Anh', 'Tiếng Hàn', 'Tiếng Nhật',
  'Tiếng Trung', 'Tiếng Pháp', 'Tiếng Thái',
];

const PREDEFINED_TAGS = [
  'hot-2024', 'hot-2025', 'hot-2026', 'phim-viet', 'phim-chieu-rap',
  'phim-bo', 'phim-le', 'oscar', 'netflix-original', 'kinh-dien',
  'phim-tet', 'phim-moi', 'anime', 'marvel', 'dc-comics',
  'blockbuster', 'indie', 'remake', 'sequel', 'prequel',
  'phim-18+', 'phim-gia-dinh', 'phim-thieu-nhi', 'vn-box-office',
];

const TITLE_MAX = 150;
const DESC_MAX = 5000;
const MAX_TAGS = 10;
const MAX_CAST = 20;

interface MovieFormProps {
  initialValues?: Partial<Movie>;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .trim();
}

// Trim whitespace + block consecutive duplicate words
function sanitizeText(text: string): string {
  let s = text.replace(/\s+/g, ' ').trim();
  const words = s.split(' ');
  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    let isDuplicate = false;
    for (let len = 3; len <= Math.min(10, Math.floor(words.length / 2)); len++) {
      if (i >= len) {
        const chunk = words.slice(i, i + len).join(' ');
        const prev = words.slice(i - len, i).join(' ');
        if (chunk === prev && chunk.length > 5) {
          isDuplicate = true;
          break;
        }
      }
    }
    if (!isDuplicate) result.push(words[i]);
  }
  return result.join(' ');
}

const MovieForm: React.FC<MovieFormProps> = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [descLength, setDescLength] = useState(0);
  const [titleLength, setTitleLength] = useState(0);
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | ''>('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null);
  const slugCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duplicateCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (initialValues) {
      const values: any = {
        ...initialValues,
        releaseDate: initialValues.releaseDate ? dayjs(initialValues.releaseDate) : undefined,
        imageUrl: (initialValues as any).imageUrl || (initialValues as any).posterUrl || (initialValues as any).backdropUrl || (initialValues as any).thumbnailUrl,
      };
      form.setFieldsValue(values);
      setDescLength((initialValues.description || '').length);
      setTitleLength((initialValues.title || '').length);
    }
  }, [initialValues, form]);

  // Debounced slug uniqueness check
  const checkSlugUnique = useCallback((slug: string) => {
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    if (!slug || slug.length < 2) { setSlugStatus(''); return; }
    setSlugStatus('checking');
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const res = await movieApi.checkSlug(slug, initialValues?.id);
        setSlugStatus(res.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('');
      }
    }, 500);
  }, [initialValues?.id]);

  // Debounced duplicate title check
  const checkDuplicate = useCallback((title: string) => {
    if (duplicateCheckTimer.current) clearTimeout(duplicateCheckTimer.current);
    if (!title || title.length < 3) { setDuplicateWarning(null); return; }
    duplicateCheckTimer.current = setTimeout(async () => {
      try {
        const year = form.getFieldValue('releaseDate')?.year()?.toString();
        const res = await movieApi.checkDuplicate(title, year, initialValues?.id);
        if (res.duplicate) {
          setDuplicateWarning(`Có phim trùng tên: "${res.movie?.title}" (${res.movie?.code})`);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        setDuplicateWarning(null);
      }
    }, 800);
  }, [initialValues?.id, form]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setTitleLength(title.length);
    if (!isEdit || !initialValues?.slug || form.getFieldValue('slug') === toSlug(initialValues?.title || '')) {
      const slug = toSlug(title);
      form.setFieldValue('slug', slug);
      checkSlugUnique(slug);
    }
    checkDuplicate(title);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+/, '');
    form.setFieldValue('slug', slug);
    checkSlugUnique(slug);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescLength(e.target.value.length);
  };

  // Auto-save draft every 15s for existing movies
  useEffect(() => {
    if (!isEdit) return;
    const interval = setInterval(() => {
      const status = form.getFieldValue('status');
      if (status === 'draft' && initialValues?.id) {
        const values = form.getFieldsValue();
        const payload = {
          ...values,
          releaseDate: values.releaseDate?.toISOString(),
          duration: Number(values.duration) || 0,
        };
        movieApi.update(initialValues.id, payload).catch(() => {});
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isEdit, initialValues?.id, form]);

  const handleFinish = async (values: any) => {
    const title = sanitizeText(values.title || '');
    const description = sanitizeText(values.description || '');
    const normalizedCategories = Array.isArray(values.categories)
      ? Array.from(
          new Set(
            values.categories
              .map((value: unknown) => String(value || '').trim())
              .filter(Boolean)
          )
        )
      : [];
    const payload = {
      ...values,
      title,
      description,
      categories: normalizedCategories,
      releaseDate: values.releaseDate?.toISOString(),
      duration: Number(values.duration) || 0,
      status: submitting === 'publish' ? 'published' : (submitting === 'draft' ? 'draft' : values.status),
    };
    setSubmitting(null);
    await onSubmit(payload);
  };

  const handleSaveDraft = () => {
    setSubmitting('draft');
    form.setFieldValue('status', 'draft');
    form.submit();
  };

  const handlePublish = () => {
    setSubmitting('publish');
    form.setFieldValue('status', 'published');
    form.submit();
  };

  const handleCancel = () => {
    router.push('/movies');
  };

  const slugSuffix = slugStatus === 'checking' ? (
    <Text type="secondary" style={{ fontSize: 12 }}>Đang kiểm tra...</Text>
  ) : slugStatus === 'available' ? (
    <Text type="success" style={{ fontSize: 12 }}>✓ Khả dụng</Text>
  ) : slugStatus === 'taken' ? (
    <Text type="danger" style={{ fontSize: 12 }}>✗ Đã tồn tại</Text>
  ) : null;

  const currentStatus = Form.useWatch('status', form) || 'draft';

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        size="large"
        initialValues={{ status: 'draft' }}
      >
        <Row gutter={24}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin chung" style={{ marginBottom: 24 }}>
              {duplicateWarning && (
                <Alert
                  message={duplicateWarning}
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  closable
                  style={{ marginBottom: 16 }}
                />
              )}
              <Form.Item
                name="title"
                label="Tên phim"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên phim' },
                  { max: TITLE_MAX, message: `Tối đa ${TITLE_MAX} ký tự` },
                  { whitespace: true, message: 'Không được chỉ có khoảng trắng' },
                ]}
                extra={<Text type="secondary">{titleLength}/{TITLE_MAX} ký tự</Text>}
              >
                <Input
                  placeholder="Nhập tên phim"
                  onChange={handleTitleChange}
                  maxLength={TITLE_MAX}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="code" label="Mã phim">
                    <Input placeholder="Tự động tạo" disabled />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    name="slug"
                    label={
                      <Space>
                        Slug
                        <Tooltip title="URL thân thiện, tự sinh từ tên phim. Chỉ chứa a-z, 0-9, dấu gạch ngang. Không bắt đầu/kết thúc bằng dấu gạch.">
                          <InfoCircleOutlined style={{ color: '#999' }} />
                        </Tooltip>
                      </Space>
                    }
                    rules={[
                      { pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, message: 'Slug chỉ chứa a-z, 0-9, dấu gạch ngang' },
                    ]}
                    extra={slugSuffix}
                  >
                    <Input placeholder="tu-dong-tu-ten-phim" onChange={handleSlugChange} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="studio" label="Hãng phim">
                    <Input placeholder="VD: Galaxy Studio" maxLength={100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="director" label="Đạo diễn">
                    <Input placeholder="VD: Trấn Thành" maxLength={100} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả' },
                  { max: DESC_MAX, message: `Tối đa ${DESC_MAX} ký tự` },
                ]}
                extra={
                  <Text type={descLength > DESC_MAX ? 'danger' : 'secondary'}>
                    {descLength.toLocaleString()}/{DESC_MAX.toLocaleString()} ký tự
                  </Text>
                }
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập mô tả phim"
                  onChange={handleDescChange}
                  spellCheck={false}
                  lang="vi"
                  maxLength={DESC_MAX}
                />
              </Form.Item>
              <Form.Item
                name="cast"
                label="Diễn viên"
                rules={[{ validator: (_, v) => v?.length > MAX_CAST ? Promise.reject(`Tối đa ${MAX_CAST} diễn viên`) : Promise.resolve() }]}
                extra={<Text type="secondary">Nhập tên rồi nhấn Enter, tối đa {MAX_CAST} người</Text>}
              >
                <Select mode="tags" placeholder="Nhập tên diễn viên rồi Enter" maxTagCount={5} maxTagTextLength={30} />
              </Form.Item>
            </Card>

            <Card title="Media" style={{ marginBottom: 24 }}>
              <Form.Item
                name="imageUrl"
                label="Ảnh phim (URL)"
                rules={[
                  { required: currentStatus === 'published', message: 'Xuất bản cần có ảnh phim' },
                  { type: 'url', message: 'URL không hợp lệ', warningOnly: true },
                ]}
                extra={<Text type="secondary">Dùng cho poster, thumbnail, backdrop. Chỉ cần 1 ảnh.</Text>}
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="trailerUrl" label="Trailer URL" rules={[{ type: 'url', message: 'URL không hợp lệ', warningOnly: true }]}>
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="videoUrl"
                    label="Video URL"
                    rules={[
                      { required: currentStatus === 'published', message: 'Xuất bản cần video hoặc trailer', warningOnly: true },
                      { type: 'url', message: 'URL không hợp lệ', warningOnly: true },
                    ]}
                  >
                    <Input placeholder="https://..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            <Card title="Phân loại & Trạng thái" style={{ marginBottom: 24 }}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Select.Option value="draft"><AntTag color="default">Nháp</AntTag></Select.Option>
                  <Select.Option value="published"><AntTag color="green">Đang chiếu</AntTag></Select.Option>
                  <Select.Option value="hidden"><AntTag color="red">Ẩn</AntTag></Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="categories"
                label="Thể loại"
                rules={[{ required: currentStatus === 'published', message: 'Xuất bản cần ít nhất 1 thể loại', type: 'array' }]}
                extra={<Text type="secondary">Có thể chọn từ danh sách hoặc tự nhập thể loại mới</Text>}
              >
                <Select mode="tags" placeholder="Chọn hoặc nhập thể loại" maxTagCount={3} listHeight={220} showSearch optionFilterProp="children" tokenSeparators={[',']}>
                  {CATEGORIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item
                name="ageRating"
                label={
                  <Space>
                    Phân loại độ tuổi
                    <Tooltip title={<div><div><b>P</b> – Mọi đối tượng</div><div><b>T13</b> – Từ 13 tuổi</div><div><b>T16</b> – Từ 16 tuổi</div><div><b>T18</b> – Từ 18 tuổi</div><div><b>C</b> – Cấm phổ biến</div></div>}>
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                }
              >
                <Select placeholder="Chọn phân loại" allowClear>
                  {AGE_RATINGS.map((r) => (
                    <Select.Option key={r.value} value={r.value}>
                      <Space>
                        <AntTag color={r.value === 'C' ? 'red' : r.value === 'T18' ? 'orange' : 'blue'}>{r.label}</AntTag>
                        <Text type="secondary" style={{ fontSize: 12 }}>{r.desc}</Text>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="tags"
                label="Tags"
                rules={[{ validator: (_, v) => v?.length > MAX_TAGS ? Promise.reject(`Tối đa ${MAX_TAGS} tags`) : Promise.resolve() }]}
                extra={<Text type="secondary">Chọn từ danh sách hoặc nhập mới, tối đa {MAX_TAGS}</Text>}
              >
                <Select mode="tags" placeholder="Chọn hoặc nhập tag" maxTagCount={4} listHeight={200} showSearch optionFilterProp="children">
                  {PREDEFINED_TAGS.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="releaseDate" label="Ngày phát hành" extra={<Text type="secondary">Định dạng: ngày/tháng/năm</Text>}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày (dd/mm/yyyy)" />
              </Form.Item>
            </Card>

            <Card title="Thông số phát" style={{ marginBottom: 80 }}>
              <Form.Item
                name="duration"
                label="Thời lượng (phút)"
                rules={[{ required: currentStatus === 'published', message: 'Xuất bản cần có thời lượng' }]}
              >
                <InputNumber min={0} max={600} style={{ width: '100%' }} placeholder="VD: 120" addonAfter="phút" />
              </Form.Item>
              <Form.Item name="language" label="Ngôn ngữ">
                <Select mode="multiple" placeholder="Chọn ngôn ngữ" listHeight={180} showSearch optionFilterProp="children">
                  {LANGUAGES.map((l) => <Select.Option key={l} value={l}>{l}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="subtitles" label="Phụ đề">
                <Select mode="multiple" placeholder="Chọn phụ đề" listHeight={180} showSearch optionFilterProp="children">
                  {LANGUAGES.map((l) => <Select.Option key={l} value={l}>{l}</Select.Option>)}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      {/* Sticky Action Bar */}
      <Affix offsetBottom={16}>
        <div style={{
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 100,
        }}>
          <Space size="middle">
            <Button icon={<CloseOutlined />} onClick={handleCancel}>Hủy</Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading && submitting === 'draft'}>Lưu nháp</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={loading && submitting === 'publish'}>
              {isEdit ? 'Cập nhật & Xuất bản' : 'Xuất bản'}
            </Button>
          </Space>
        </div>
      </Affix>
    </>
  );
};

export default MovieForm;
